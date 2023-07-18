import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { WtReport } from "src/app/models/wt-report";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"],
})
export class ReportsPage implements OnInit {
  busqueda = new FormControl("", []);

  public reports$: Observable<WtReport[]>;

  constructor(
    private reportService: ReportService,
    private utilsSvc: UtilsService
  ) {
    this.reports$ = this.reportService.reports;
  }

  ngOnInit() {}

  onViewReport(report: WtReport) {
    this.reportService.patchActiveReport(report);
    this.utilsSvc.routerLink("/tabs/reports/report-details");
  }

  /**
   * Downloads pdf report.
   *
   * @param report
   */
  public async onDawnloadReport(report: WtReport) {
    const result = await Filesystem.writeFile({
      path: `reporte-${report.localId}.pdf`,
      data: report.urlPdf,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    /**
     * @todo @mario Abrir archivo pdf.
     */

    // urlPdf
    this.utilsSvc.presentToast(`Archivo descargado en ${result.uri}.`);
  }
}
