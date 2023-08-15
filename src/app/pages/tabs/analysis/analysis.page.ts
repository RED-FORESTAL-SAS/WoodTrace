import { Component, OnDestroy, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";
import { ReportService } from "src/app/services/report.service";
import { UserService } from "src/app/services/user.service";
import { switchMap, take, tap } from "rxjs/operators";
import { WtLicense } from "src/app/models/wt-license";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map, skipWhile } from "rxjs/operators";
import { WtReport } from "src/app/models/wt-report";

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.page.html",
  styleUrls: ["./analysis.page.scss"],
})
export class AnalysisPage implements OnInit, OnDestroy {
  /** Observable with active license or null. */
  public license$: Observable<WtLicense | null>;

  /** Observable with boolean indicating if license is active or not. */
  public licenseIsActive$: Observable<boolean>;

  /** Observable with active report or null. */
  public activeReport$: Observable<WtReport | null>;

  /** Observable with boolean indicating if there is an active report or not. */
  public hasActiveReport$: Observable<boolean>;

  /** BehaviorSubject to deal with event "create new report" */
  public createNewReportEvent = new BehaviorSubject<number>(null);

  /** BehaviorSubject to deal with event "continue report" */
  public continueReportEvent = new BehaviorSubject<number>(null);

  private sbs: Subscription[] = [];

  constructor(
    private reportService: ReportService,
    private userService: UserService,
    private utilsSvc: UtilsService
  ) {
    this.license$ = this.userService.license;
    this.licenseIsActive$ = this.userService.license.pipe(
      map((license) => !!license)
    );

    this.activeReport$ = this.reportService.activeReport;
    this.hasActiveReport$ = this.reportService.activeReport.pipe(
      map((report) => !!report)
    );
  }

  /**
   * Build subscriptions/event handlers for component, every time Page is 'Entered'.
   */
  ngOnInit(): void {
    this.createNewReportHandler();
    this.continueReportHandler();
  }

  /**
   * Destroy subscriptions/event handlers for component, every time Page is 'Left'.
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
    this.createNewReportEvent.complete();
    this.continueReportEvent.complete();
  }

  /**
   * Triggers the creation of a new report.
   */
  createNewReport(): void {
    this.createNewReportEvent.next(Date.now());
  }

  /**
   * Triggers the continuation of an existing report.
   */
  continueReport(): void {
    this.continueReportEvent.next(Date.now());
  }

  /**
   * Handles the event "create new report".
   */
  createNewReportHandler(): void {
    this.sbs.push(
      this.createNewReportEvent
        .asObservable()
        .pipe(
          skipWhile((v) => v === null),
          switchMap((_) => this.reportService.activeReport.pipe(take(1))),
          tap({
            next: (report) => {
              // If there is no active report, it creates a new one and start the analysis.
              if (!report) {
                this.continueWithNewReport();
                return;
              }

              // Otherwise, ask user if they want to overwrite the existing Report.
              this.utilsSvc.presentAlertConfirm({
                header: "Análisis en curso",
                message:
                  "¿Deseas sobrescribir el análisis previo por uno nuevo?",
                buttons: [
                  {
                    text: "Nuevo análisis",
                    handler: () => {
                      this.continueWithNewReport();
                    },
                  },
                  {
                    text: "Cancelar",
                    handler: () => {},
                  },
                ],
              });
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * Creates an empty Report in local storage and redirects to the analysis form.
   */
  private continueWithNewReport(): void {
    const emptyReport = this.reportService.emptyReport;
    this.reportService.patchActiveReport({ ...emptyReport });
    this.utilsSvc.routerLink("/tabs/analysis/analysis-form");
  }

  /**
   * Handles the event "continue report".
   */
  continueReportHandler(): void {
    this.sbs.push(
      this.continueReportEvent
        .asObservable()
        .pipe(
          skipWhile((v) => v === null),
          switchMap((_) => this.reportService.activeReport.pipe(take(1))),
          tap({
            next: (report) => {
              // If there is no active report, it creates a new one and start the analysis.
              if (report !== null) {
                this.utilsSvc.routerLink("/tabs/analysis/analysis-form");
                return;
              }

              // Otherwise, ask user if they want to overwrite the existing Report.
              this.utilsSvc.presentAlertConfirm({
                header: "No hay análisis",
                message: "No posees ningún análisis sin terminar",
                buttons: [
                  {
                    text: "Aceptar",
                    handler: () => {},
                  },
                ],
              });
            },
          })
        )
        .subscribe()
    );
  }
}
