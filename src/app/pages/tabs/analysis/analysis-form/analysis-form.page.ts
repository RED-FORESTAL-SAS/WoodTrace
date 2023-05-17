import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { colombia } from "src/assets/data/colombia-departments-towns";
import { Geolocation } from "@capacitor/geolocation";
import { ReportService } from "src/app/services/report.service";
import { skipWhile, switchMap, take, tap } from "rxjs/operators";
import { BehaviorSubject, Subscription } from "rxjs";
import { pais } from "src/assets/data/country";

@Component({
  selector: "app-analysis-form",
  templateUrl: "./analysis-form.page.html",
  styleUrls: ["./analysis-form.page.scss"],
})
export class AnalysisFormPage implements OnInit, OnDestroy {
  departamento = new FormControl("", [Validators.required]);
  municipio = new FormControl("", [Validators.required]);
  guia = new FormControl("", [Validators.required]);
  placa = new FormControl("", [Validators.required]);

  latitude: number;
  longitude: number;

  private sbs: Subscription[] = [];

  pais = pais;
  option = "Division[]";
  departamentos = [];
  municipios = [];

  user = {} as User;

  loading: boolean;

  /** BehaviourSubject to deal with event "updateReport". */
  private updateReportEvent = new BehaviorSubject<number>(null);

  constructor(
    private reportService: ReportService,
    private utilsSvc: UtilsService
  ) {
    // Wire up event handlers.
    this.updateReportHandler();
  }

  ngOnInit() {
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
          switchMap((_) => this.reportService.activeReport.pipe(take(1))),
          tap({
            next: (report) => {
              // Extract form values.
              const patchData = {
                ...report,
                departamento: this.departamento.value,
                municipio: this.municipio.value,
                guia: this.guia.value,
                placa: this.placa.value,
                ubicacion: {
                  lat: this.latitude,
                  lng: this.longitude,
                },
              };

              this.reportService.patchActiveReport(patchData);
              this.utilsSvc.routerLink("/tabs/analysis/how-to-use");
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
