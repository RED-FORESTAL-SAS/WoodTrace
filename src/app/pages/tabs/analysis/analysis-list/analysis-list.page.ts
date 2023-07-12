import { Component, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";
import { ReportService } from "src/app/services/report.service";
import { WtReport } from "src/app/models/wt-report";
import { Observable, Subscription } from "rxjs";
import { WtWood } from "src/app/models/wt-wood";

@Component({
  selector: "app-analysis-list",
  templateUrl: "./analysis-list.page.html",
  styleUrls: ["./analysis-list.page.scss"],
})
export class AnalysisListPage implements OnInit {
  public report$: Observable<WtReport | null>;

  private sbs: Subscription[] = [];

  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {
    this.report$ = this.reportService.activeReport;
  }

  ngOnInit() {}

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
            /**
             * @todo @diana Mostrar un loading.
             */
            await this.reportService.saveActiveReport();
            this.utilsSvc.presentToast("Reporte generado.");
            this.utilsSvc.routerLink("/tabs/reports");
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
