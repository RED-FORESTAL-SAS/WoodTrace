import { Component, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";
import { ReportService } from "src/app/services/report.service";
import { WtReport } from "src/app/models/wt-report";
import { Observable, Subscription } from "rxjs";
import { WtWood } from "src/app/models/wt-wood";
import { Router } from "@angular/router";

@Component({
  selector: "app-analysis-list",
  templateUrl: "./analysis-list.page.html",
  styleUrls: ["./analysis-list.page.scss"],
})
export class AnalysisListPage {
  public report$: Observable<WtReport | null>;

  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService,
    private router: Router
  ) {
    this.report$ = this.reportService.activeReport;

    /**
     * @todo @mario Suscribirse al reportService.error, para vigilar los errores que ocurran en el
     * state.
     */
  }

  onDeleteWood(index: number) {
    this.utilsSvc.presentAlertConfirm({
      header: "Eliminar análisis",
      message: "¿Estás seguro que deseas eliminar el análisis?",
      buttons: [
        {
          text: "Eliminar",
          handler: () => {
            this.reportService.removeWoodFromActiveReport(index);
            this.utilsSvc.presentToast("Análisis eliminado.");
          },
        },
        {
          text: "Cancelar",
          handler: () => {},
          /**
           * @todo manejo de errores.
           */
        },
      ],
    });
  }

  onViewWood(wood: WtWood) {
    this.reportService.patchActiveWood(wood);
    this.utilsSvc.routerLink("/tabs/analysis/analysis-details");
  }

  async nuevoAnalisis() {
    this.reportService.patchActiveWood(this.reportService.emptyWood);
    this.utilsSvc.routerLink("/tabs/analysis/take-photos");
  }

  generarReporte() {
    this.utilsSvc.presentAlertConfirm({
      header: "Generar Reporte",
      message:
        "¿Estás seguro que deseas finalizar el análisis y generar el reporte?",
      buttons: [
        {
          text: "Generar Reporte",
          handler: async () => {
            await this.utilsSvc.presentLoading("Generando...");
            await this.reportService.saveActiveReport();
            this.utilsSvc.presentToast("Reporte generado.");
            this.router.navigate(["/tabs/analysis"]).then(() => {
              this.utilsSvc.routerLink("/tabs/reports");
            });
            await this.utilsSvc.dismissLoading();
          },
        },
        {
          text: "Cancelar",
          handler: () => {},
          /**
           * @todo manejo de errores.
           */
        },
      ],
    });
  }
}
