import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { WtReport } from "src/app/models/wt-report";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { NoNetworkFailure } from "src/app/utils/failure.utils";
import { map, skip, takeUntil } from "rxjs/operators";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"],
})
export class ReportsPage implements OnInit {
  busqueda = new FormControl("", []);

  public reports$: Observable<WtReport[]>;
  public loadingReports$: Observable<boolean>;
  private sbs: Subscription[] = [];

  constructor(
    private reportService: ReportService,
    private utilsSvc: UtilsService
  ) {
    this.loadingReports$ = this.reportService.loadingReports;
    this.reports$ = this.reportService.reports;
  }

  /**
   * Retrieve first page of data from remote database.
   *
   * @dev In ionic ngOnInit runs only once the first time the page is loaded.
   */
  ngOnInit(): void {
    this.reportService.fetchNextReportPage();
  }

  /**
   * Load first page.
   * Subscribe to error state.
   */
  ionViewDidEnter() {
    this.sbs.push(
      this.reportService.error.subscribe((failure) => {
        if (failure !== null) {
          if (failure instanceof NoNetworkFailure) {
            this.utilsSvc.presentToast("No hay conexión a internet.");
          } else {
            this.utilsSvc.presentToast("Ocurrió un error desconocido.");
          }

          this.reportService.cleanError();
        }
      })
    );
  }

  ionViewWillLeave(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

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

  /**
   * Request service to load next page of reports.
   */
  fetchNextReportPage() {
    this.reportService.fetchNextReportPage();
  }
}
