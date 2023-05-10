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

@Component({
  selector: "app-analysis-form",
  templateUrl: "./analysis-form.page.html",
  styleUrls: ["./analysis-form.page.scss"],
})
export class AnalysisFormPage implements OnInit, OnDestroy {
  department = new FormControl("", [Validators.required]);
  town = new FormControl("", [Validators.required]);
  guia = new FormControl("", [Validators.required]);
  placa = new FormControl("", [Validators.required]);

  latitude: number;
  longitude: number;

  private sbs: Subscription[] = [];

  departments = [];
  towns = [];
  /**
   * @todo de donde vamos a sacar los departamentos???
   */
  departamentoList = [
    { content: "antioquia", value: "Antioquia" },
    { content: "atlantico", value: "Atlántico" },
    { content: "amazonas", value: "Amazonas" },
  ];

  /**
   * @todo de donde vamos a sacar los municipios???
   */
  municipioList = [
    { content: "jardin", value: "Jardín" },
    { content: "tamesis", value: "Támesis" },
  ];

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
    this.departments = this.departamentoList;
    this.towns = this.municipioList;
    this.populateForm();
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
              console.log(report.departamento);
              this.department.setValue(report.departamento);
              this.town.setValue(report.municipio);
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

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
  }

  ionViewDidEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    // this.getDeparments();
  }

  /**
   * We're using the Object.keys() method to get an array of the keys of the colombia object, then we're
   * using the map() method to iterate over the array and return an array of objects with the value and
   * content properties
   * @todo @diana revisar si esto si sirve para alguna cosa e implementar el array nuevo.
   */
  getDeparments() {
    this.departments = Object.keys(colombia).map((department) => {
      return {
        value: department,
        content: department,
      };
    });
  }

  /**
   * It loops through the object and if the value of the department is equal to the key of the object,
   * it maps the value of the object to the towns array
   * * @todo @diana revisar si esto si sirve para alguna cosa e implementar el array nuevo.
   */
  getTowns() {
    this.town.reset();
    for (let [key, value] of Object.entries(colombia)) {
      if (this.department.value == key) {
        this.towns = value.map((department) => {
          return {
            value: department,
            content: department,
          };
        });
      }
    }
  }

  /**
   * The function calls the Geolocation plugin's getCurrentPosition() function, which returns a promise
   * that resolves to a Coordinates object
   */
  // async getCurrentPosition() {
  //   this.utilsSvc.presentLoading();

  //   const coordinates = await Geolocation.getCurrentPosition();
  //   this.utilsSvc.dismissLoading();

  //   if (coordinates && coordinates.coords) {
  //     this.latitude = coordinates.coords.latitude;
  //     this.longitude = coordinates.coords.longitude;
  //   }
  // }

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
                departamento: this.department.value,
                municipio: this.town.value,
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

  validator() {
    if (this.department.invalid) {
      return false;
    }
    if (this.town.invalid) {
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
