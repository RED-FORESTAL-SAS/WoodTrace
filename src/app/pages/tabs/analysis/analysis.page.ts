import { Component, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";
import {
  LicenseFailure,
  LicenseService,
} from "src/app/services/license.service";
import { NoNetworkFailure } from "src/app/utils/failure.utils";
import { ReportService } from "src/app/services/report.service";

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.page.html",
  styleUrls: ["./analysis.page.scss"],
})
export class AnalysisPage implements OnInit {
  /**
   * Flag to enable/disable the buttons, depending on licence state.
   */
  public licenseActive: boolean = false;

  constructor(
    private utilsSvc: UtilsService,
    private licenseService: LicenseService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.checkLicense();
  }

  /**
   * Checks if there is an active license for the current user and disables/enables the buttons.
   */
  async checkLicense(): Promise<void> {
    try {
      await this.licenseService.retrieveActiveLicense();
      this.licenseActive = true;
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
      this.licenseActive = false;
    }
  }

  /**
   * Checks if there is an active report in the local storage. If there is, it asks the user if they
   * want to continue with the current report or start a new one. If there is not, it creates a new
   * report and starts the analysis.
   *
   * @returns
   */
  async confirmNewReportBeforeContinue(): Promise<void> {
    const hasActiveLicense = await this.checkIfLicenseIsValid();
    if (!hasActiveLicense) return;

    // If there is no active report, it creates a new one and starts the analysis.
    const activeReport = this.reportService.fetchFromLocalStorage();
    if (activeReport === null) {
      this.continueWithNewReport();
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
            this.continueWithNewReport();
          },
        },
      ],
    });
  }

  /**
   * Checks if user has a valid licence and returns a Promise<boolean> with result.
   * Shows alert if no valid licence is found or if any error ocurs.
   *
   * @returns
   */
  async checkIfLicenseIsValid(): Promise<boolean> {
    try {
      await this.licenseService.retrieveActiveLicense();
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
   * Creates an empty Report in local storage and redirects to the analysis form.
   */
  continueWithNewReport(): void {
    this.reportService.saveToLocalStorage(this.reportService.emptyReport);

    /**
     * @todo @diana Verificar si hay que crear en este punto el WtWood vacío para tomar la primera muestra,
     * o si esto será responsabilidad de la primera pantalla del proceso de toma de muestras.
     */

    this.utilsSvc.routerLink("/tabs/analysis/analysis-form");
  }

  /**
   * Redirects to analysis route, to continue with existing (in local storage) report.
   */
  continueWithActiveReport() {
    // Validate if current report exists, before redirecting.
    const currentReport = this.reportService.fetchFromLocalStorage();
    if (currentReport === null) {
      this.utilsSvc.presentFinkAlert({
        title: "No hay análisis",
        content: "No posees ningún análisis sin terminar.",
        btnText: "Aceptar",
      });
      return;
    }

    /**
     * @todo @diana Verificar por qué esto no se está llendo a ninguna parte.
     */
    this.utilsSvc.routerLink("/tabs/analysis/analysis-trees/pending");
  }
}
