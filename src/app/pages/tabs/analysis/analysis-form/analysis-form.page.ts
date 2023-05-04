import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { colombia } from "src/assets/data/colombia-departments-towns";
import { Geolocation } from "@capacitor/geolocation";

@Component({
  selector: "app-analysis-form",
  templateUrl: "./analysis-form.page.html",
  styleUrls: ["./analysis-form.page.scss"],
})
export class AnalysisFormPage implements OnInit {
  department = new FormControl("", [Validators.required]);
  town = new FormControl("", [Validators.required]);
  guia = new FormControl("", [Validators.required]);
  placa = new FormControl("", [Validators.required]);

  latitude: number;
  longitude: number;

  departments = [];
  towns = [];
  /**
   * @todo de donde vamos a sacar los departamentos???
   */
  departamentoList = [
    { content: "antioquia", value: "Antioquia" },
    { content: "atlantico", value: "Atlántico" },
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

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {
    // this.species.disable();
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
  }

  ionViewDidEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getDeparments();
    // this.getProperties();
  }

  /**
   * We're using the Object.keys() method to get an array of the keys of the colombia object, then we're
   * using the map() method to iterate over the array and return an array of objects with the value and
   * content properties
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
  async getCurrentPosition() {
    this.utilsSvc.presentLoading();

    const coordinates = await Geolocation.getCurrentPosition();
    this.utilsSvc.dismissLoading();

    if (coordinates && coordinates.coords) {
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
    }
  }

  createReport() {
    console.log("entra a createReport");
    const location = { latitude: this.latitude, longitude: this.longitude };
    let data = {
      id: "",
      localId: "",
      departament: this.department.value,
      town: this.town.value,
      location: location,
      placa: this.placa.value,
      guia: this.guia.value,
      analisis: [],
      localPathXls: "",
      pathPdf: "",
      urlPdf: "",
      wtUserId: "",
      fCreado: this.utilsSvc.getCurrentDate(),
      fModificado: this.utilsSvc.getCurrentDate(),
    };

    this.utilsSvc.saveLocalStorage("wt_report", data);
    this.utilsSvc.routerLink("/tabs/analysis/how-to-use");
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
