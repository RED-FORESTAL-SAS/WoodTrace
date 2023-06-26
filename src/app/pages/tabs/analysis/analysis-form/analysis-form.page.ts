import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UtilsService } from "src/app/services/utils.service";
import { Geolocation } from "@capacitor/geolocation";
import { ReportService } from "src/app/services/report.service";
import {
  skipWhile,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { pais } from "src/assets/data/country";
import { WtUser } from "src/app/models/wt-user";
import { UserService } from "src/app/services/user.service";
import { WtReport } from "src/app/models/wt-report";
import { NoNetworkFailure } from "src/app/utils/failure.utils";
import { personaTypes } from "src/assets/data/persona-types";
import { docTypes } from "src/assets/data/document-types";

@Component({
  selector: "app-analysis-form",
  templateUrl: "./analysis-form.page.html",
  styleUrls: ["./analysis-form.page.scss"],
})
export class AnalysisFormPage implements OnInit, OnDestroy {
  departamento = new FormControl("", [Validators.required]);
  municipio = new FormControl("", [Validators.required]);
  guia = new FormControl("", []);
  placa = new FormControl("", []);
  personaType = new FormControl("", [Validators.required]);
  fullName = new FormControl("", [Validators.minLength(4)]);
  docType = new FormControl(0, []);
  docNumber = new FormControl("", [Validators.minLength(6)]);

  latitude: number;
  longitude: number;

  pais = pais;
  option = "Division[]";
  departamentos = [];
  municipios = [];
  personaTypes = [];
  docTypes = [];

  private sbs: Subscription[] = [];

  /** Observable with active license or null. */
  public user$: Observable<WtUser | null>;

  loading: boolean;

  /** BehaviourSubject to deal with event "updateReport". */
  private updateReportEvent = new BehaviorSubject<number>(null);

  constructor(
    private reportService: ReportService,
    private utilsSvc: UtilsService,
    private userService: UserService
  ) {
    this.user$ = this.userService.user;
    // Wire up event handlers.
    this.updateReportHandler();
  }

  ngOnInit() {
    this.docTypes = docTypes;
    this.personaTypes = personaTypes;
    this.departamentos = pais.division.map((division) => division);
    this.populateForm();
    this.onChanges();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  populateForm() {
    this.sbs.push(
      this.reportService.activeReport
        .pipe(
          take(1),
          tap({
            next: (report) => {
              console.log(report);
              /**
               * @todo revisar el populate que si se esté poblando como debe y
               * cómo hacemos para no duplicar este código.
               */
              if (report.departamento !== "") {
                const dpto = pais.division.find(
                  (depto) => depto.nombre === report.departamento
                );
                this.municipios = dpto.division.map((division) => division);
              }
              this.departamento.setValue(report.departamento);
              this.municipio.setValue(report.municipio);
              this.guia.setValue(report.guia);
              this.placa.setValue(report.placa);
              this.personaType.setValue(report.personaType);
              this.fullName.setValue(report.fullName);
              this.docType.setValue(report.docType);
              this.docNumber.setValue(report.docNumber);
              this.latitude = report.ubicacion.lat;
              this.longitude = report.ubicacion.lng;
            },
          })
        )
        .subscribe()
    );
  }

  onChanges() {
    this.sbs.push(
      this.departamento.valueChanges.subscribe((v) => {
        if (this.departamento.value === "") {
          this.municipio.setValue("");
        } else {
          this.municipio.setValue("");
          this.municipios = pais.division
            .find((depto) => depto.nombre === v)
            .division.map((division) => division);
        }
      })
    );
  }

  public updateReport(): void {
    this.updateReportEvent.next(Date.now());
  }

  private updateReportHandler(): void {
    this.sbs.push(
      this.updateReportEvent
        .asObservable()
        .pipe(
          skipWhile((v) => v === null),
          switchMap((_) =>
            this.reportService.activeReport.pipe(
              take(1),
              withLatestFrom(this.userService.user)
            )
          ),
          tap({
            next: async ([report, user]: [WtReport, WtUser]) => {
              // Extract form values.
              const patchData = {
                ...report,
                departamento: this.departamento.value,
                municipio: this.municipio.value,
                personaType: this.personaType.value,
                fullName: this.fullName.value,
                docType: this.docType.value,
                docNumber: this.docNumber.value,
                guia: this.guia.value,
                placa: this.placa.value,
                ubicacion: {
                  lat: this.latitude,
                  lng: this.longitude,
                },
              };

              this.reportService.patchActiveReport(patchData);
              if (user.firstReport !== false) {
                const patchData = {
                  ...user,
                  firstReport: false,
                };
                await this.userService.patchUser(patchData, true).catch((e) => {
                  if (e instanceof NoNetworkFailure) {
                    this.utilsSvc.presentToast(
                      "No se pudo guardar la información, por favor verifica tu conexión a internet."
                    );
                  }
                });
                this.utilsSvc.routerLink("/tabs/analysis/how-to-use");
              } else {
                this.utilsSvc.routerLink("/tabs/analysis/take-photos");
              }
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * The function calls the Geolocation plugin's getCurrentPosition() function, which returns a promise
   * that resolves to a Coordinates object
   */
  async getCurrentPosition() {
    this.utilsSvc.presentLoading();

    const coordinates = await Geolocation.getCurrentPosition();
    this.utilsSvc.dismissLoading();

    if (coordinates && coordinates.coords) {
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
    }
  }

  validator() {
    if (this.departamento.invalid) {
      return false;
    }
    if (this.municipio.invalid) {
      return false;
    }

    if (this.guia.invalid) {
      return false;
    }

    if (this.placa.invalid) {
      return false;
    }

    return true;
  }
}
