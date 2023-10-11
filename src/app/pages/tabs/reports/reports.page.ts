import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { WtReport } from "src/app/models/wt-report";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { NoNetworkFailure } from "src/app/utils/failure.utils";
import {
  skipWhile,
  take,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { FileOpener } from "@capacitor-community/file-opener";
import { PdfService } from "src/app/services/pdf.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"],
})
export class ReportsPage implements OnInit, OnDestroy {
  busqueda = new FormControl("", []);

  public reports$: Observable<WtReport[]>;
  public loadingReports$: Observable<boolean>;

  /** BehaviorSubject to deal with event "download report" */
  public downloadReportEvent = new BehaviorSubject<WtReport>(null);

  /** Observable that checks if device is online/offline. */
  public online$: Observable<boolean>;

  /** Array with all subscriptions. */
  private sbs: Subscription[] = [];

  constructor(
    private reportService: ReportService,
    private userService: UserService,
    private pdfService: PdfService,
    private utilsSvc: UtilsService
  ) {
    this.loadingReports$ = this.reportService.loadingReports;
    this.reports$ = this.reportService.reports;
    this.online$ = this.userService.online;
  }

  /**
   * Retrieve first page of data from remote database.
   *
   * @dev In ionic ngOnInit runs only once the first time the page is loaded.
   */
  ngOnInit(): void {
    this.downloadReportHandler();

    // Load first page if no reports are loaded.
    this.reports$
      .pipe(take(1))
      .toPromise()
      .then((reports) => {
        if (reports.length === 0) {
          this.reportService.fetchNextReportPage();
        }
      });
  }

  /**
   * Destroy subscriptions/event only when the page is destroyed (app closed).
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
    // this.downloadReportEvent.complete();
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
    // this.sbs.forEach((s) => s.unsubscribe());
  }

  onViewReport(report: WtReport) {
    this.reportService.patchActiveReport(report);
    this.utilsSvc.routerLink("/tabs/reports/report-details");
  }

  /**
   * Triggers the download of a report.
   *
   * @param report
   */
  async downloadReport(report: WtReport): Promise<void> {
    this.downloadReportEvent.next(report);
  }

  /**
   * Handles the event "download report".
   */
  private downloadReportHandler() {
    this.sbs.push(
      this.downloadReportEvent
        .asObservable()
        .pipe(
          skipWhile((v) => v === null),
          withLatestFrom(this.userService.user),
          withLatestFrom(this.userService.company),
          tap({
            next: async ([[report, user], company]) => {
              await this.utilsSvc.presentLoading("Descargando...");
              await this.pdfService.buildReportPdf(report, user, company, true);
              await this.utilsSvc.dismissLoading();
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * Downloads pdf report.
   *
   * @param report
   */
  public async onDawnloadReport(report: WtReport): Promise<void> {
    await this.utilsSvc.presentLoading();

    /**
     * @dev No need to request for permissions since Filesytem will do it automatically.
     */

    const result = await Filesystem.writeFile({
      path: `reporte-${report.localId}.pdf`,
      data: report.urlPdf,
      directory: Directory.External,
      encoding: Encoding.UTF8,
      // @dev no encoding value is provided to write file as base64 encoded.
    });

    this.open(result.uri);

    // urlPdf
    // this.utilsSvc.presentToast(`Archivo descargado en ${result.uri}.`);
    await this.utilsSvc.dismissLoading();
  }

  /**
   * Request service to load next page of reports.
   */
  fetchNextReportPage() {
    this.reportService.fetchNextReportPage();
  }

  open = async (filePath: string) => {
    await FileOpener.open({
      filePath: filePath,
      openWithDefault: true,
      contentType: "application/pdf",
    });
  };
}
