import { Component, OnInit } from "@angular/core";
import { ACTIVE_REPORT_LS_KEY } from "src/app/constants/active-report-ls-key.constant";
import { ACTIVE_WOOD_LS_KEY } from "src/app/constants/active-wood-ls-key.constant";
import { LICENCES_FB_COLLECTION } from "src/app/constants/licenses-fb-collection";
import { User } from "src/app/models/user.model";
import { NEW_WT_REPORT, getNewReport } from "src/app/models/wt-report";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { limit, orderBy, where } from "../../../types/query-constraint.type";
import { WtLicense } from "src/app/models/wt-license";
import { ACTIVE_LICENSE_LS_KEY } from "src/app/constants/active-license-ls-key.constant";
import {
  LicenseFailure,
  LicenseService,
} from "src/app/services/license.service";
import { NoNetworkFailure } from "src/app/utils/failure.utils";

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.page.html",
  styleUrls: ["./analysis.page.scss"],
})
export class AnalysisPage implements OnInit {
  user = {} as User;

  constructor(
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService,
    private licensesService: LicenseService
  ) {}

  ngOnInit() {
    /**
     * @todo: @diana Esto es un mock que carga la licencia, para que esté disponible para su uso
     * fuera de línea. Quitar esto cuando se implemente la carga de la licencia en la redemción y en el
     * login.
     *
     * @todo: @diana Eliminar este ngOnInit, a lo que se quite el mock.
     */
    this.licensesService
      .retrieveActiveLicense()
      .then((license) => {
        console.log(this.utilsSvc.getFromLocalStorage(ACTIVE_LICENSE_LS_KEY));
      })
      .catch((e) => {
        console.log("👨‍🔧 Error al intentar recuperar la licencia.");
        console.log(e);
      });
  }

  // ionViewWillEnter() {
  //   /**
  //    * @todo @mario Eliminar esto. No se utilizará más. Es código duplicado.
  //    */
  //   this.user = this.utilsSvc.getCurrentUser();
  // }

  // ionViewDidEnter() {
  //   /**
  //    * @todo @mario Eliminar esto. No se utilizará más.
  //    */
  //   // this.user = this.utilsSvc.getCurrentUser();
  //   // this.getLicenseRemainingDays();
  // }

  // /**
  //  * It calculates the difference between two dates and returns the number of days
  //  */
  // getLicenseRemainingDays() {
  //   /**
  //    * @todo @mario Hacer esta llamada en el mismo evento del botón. No es necesario hacerlo cada vez
  //    * que se entra a la página.
  //    */
  //   if (this.user.license && this.user.license.dateInit) {
  //     let currentDate = this.utilsSvc.getCurrentDate();
  //     this.user.license.remainingDays = this.utilsSvc.getDiffDays(
  //       currentDate,
  //       this.user.license.dateEnd
  //     );

  //     /**
  //      * @todo @mario No borrar la licencia si está vencida. No tiene sentido.
  //      */
  //     if (this.user.license.remainingDays <= 0) {
  //       this.firebaseSvc.deleteFromCollection("licenses", this.user.license.id);
  //     }
  //   }
  // }

  newAnalysis() {
    if (this.user.license && this.user.license.remainingDays) {
      this.utilsSvc.routerLink("/tabs/analysis/analysis-form");
    } else {
      this.noMembership();
    }
  }

  /**
   * Checks if user has a valid licence and returns a Promise<boolean> with result.
   * Shows alert if no valid licence is found or if any error ocurs.
   *
   * @returns
   */
  async checkIfLicenseIsValid(): Promise<boolean> {
    try {
      await this.licensesService.retrieveActiveLicense();
      return true;
    } catch (e) {
      if (e instanceof LicenseFailure) {
        this.utilsSvc.presentFinkAlert({
          title: "No hay Licencia activa",
          content:
            "Para realizar un análisis debes tener una licencia activa. Podrás encontrar más información sobre la licencia en tu perfil.",
          btnText: "Aceptar",
          route: "tabs/profile/membership",
        });
      } else if (e instanceof NoNetworkFailure) {
        this.utilsSvc.presentFinkAlert({
          title: "Sin acceso a internet",
          content:
            "Parece que no tienes conexión a internet. Por favor intenta de nuevo.",
          btnText: "Aceptar",
        });
      } else {
        this.utilsSvc.presentFinkAlert({
          title: "Error",
          content:
            "Ha ocurrido un error al intentar validar la licencia. Intenta de nuevo.",
          btnText: "Aceptar",
        });
      }
      return false;
    }
  }

  /**
   * Checks if there is an active report in the local storage. If there is, it asks the user if they
   * want to continue with the current report or start a new one. If there is not, it creates a new
   * report and starts the analysis.
   *
   * @returns
   */
  async confirmNewAnalysisOverContinue(): Promise<void> {
    const hasActiveLicense = await this.checkIfLicenseIsValid();
    if (!hasActiveLicense) return;

    /**
     * @todo @mario Aqui vamos! No acceder al localstorage directamente. Hacerlo a traves de los servicios.
     */
    const activeReport =
      this.utilsSvc.getFromLocalStorage(ACTIVE_REPORT_LS_KEY);

    // If there is no active report, it creates a new one and starts the analysis.
    if (!activeReport) {
      const newReport = getNewReport(this.utilsSvc.getCurrentUser());
      this.utilsSvc.saveLocalStorage(ACTIVE_REPORT_LS_KEY, newReport);
      this.newAnalysis();
      return;
    }

    // Otherwise, ask user if they want to overwrite the existing Report.
    this.utilsSvc.presentAlertConfirm({
      header: "Advertencia",
      message:
        "Tienes un análisis en proceso. Al iniciar un análisis nuevo estarás reemplazando el anterior",
      buttons: [
        {
          text: "Cancelar",
          handler: () => {},
        },
        {
          text: "Confirmar",
          handler: () => {
            this.newAnalysis();
          },
        },
      ],
    });
  }

  continueAnalysis() {
    let currentAnalysis = this.utilsSvc.getFromLocalStorage("analysis");

    if (currentAnalysis) {
      this.utilsSvc.routerLink("/tabs/analysis/analysis-trees/pending");
    } else {
      this.utilsSvc.presentFinkAlert({
        title: "No hay análisis",
        content: "No posees ningún análisis sin terminar.",
        btnText: "Aceptar",
      });
    }
  }

  noMembership() {
    this.utilsSvc.presentFinkAlert({
      title: "No hay Licencia activa",
      content:
        "Para realizar un análisis debes tener una licencia activa. Podrás encontrar más información sobre la licencia en tu perfil.",
      btnText: "Aceptar",
      route: "tabs/profile/membership",
    });
  }
}
