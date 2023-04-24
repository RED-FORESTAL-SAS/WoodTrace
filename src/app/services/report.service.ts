import { Injectable } from "@angular/core";
import {
  LocalStorageWtReport,
  NEW_WT_REPORT,
  WtReport,
} from "../models/wt-report";
import { WoodService } from "./wood.service";
import { Timestamp } from "../types/timestamp.type";
import { ACTIVE_REPORT_LS_KEY } from "../constants/active-report-ls-key.constant";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { UserService } from "./user.service";
import { ReportStore } from "../state/report.store";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { WtWood } from "../models/wt-wood";
import { Failure } from "../utils/failure.utils";
import { REPORTS_LS_KEY } from "../constants/reports-ls-key.constant";

/**
 * Failure for ReportDomain.
 */
export class ReportFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(
    private localStorage: LocalStorageRepository,
    private store: ReportStore,
    private userService: UserService,
    private woodService: WoodService
  ) {
    // Initialize active report with value from localStorage, if any, or null.
    // Inicialize reports with value from localStorage, if any, or empty array.
    this.store.patch({
      activeReport: this.fetchActiveReportFromLocalStorage(),
      reports: this.fetchReportsFromLocalStorage(),
    });
  }

  /**
   * Returns a new empty Report.
   *
   * @param user
   * @returns
   */
  get emptyReport(): WtReport {
    return {
      ...NEW_WT_REPORT,
      localId: new Date().getTime().toString(),
      wtUserId: this.userService.currentUser!.id,
      fCreado: Timestamp.fromDate(new Date()),
      fModificado: Timestamp.fromDate(new Date()),
    };
  }

  /**
   * Getter for active report from state.
   */
  get activeReport(): Observable<WtReport | null> {
    return this.store.state$.pipe(map((state) => state.activeReport));
  }

  /**
   * Getter for active wood from state.
   */
  get activeWood(): Observable<WtWood | null> {
    return this.store.state$.pipe(map((state) => state.activeWood));
  }

  /**
   * Getter for reports from state.
   */
  get reports(): Observable<WtReport[]> {
    return this.store.state$.pipe(map((state) => state.reports));
  }

  /**
   * Patch value for active report, and updates local storage.
   *
   * @param activeReport
   */
  public patchActiveReport(activeReport: WtReport | null): void {
    this.saveActiveRerportToLocalStorage(activeReport);
    this.store.patch({ activeReport: activeReport });
  }

  /**
   * Patch value for active wood, and updates local storage.
   *
   * @param activeWood
   */
  public patchActiveWood(activeWood: WtWood | null): void {
    this.woodService.saveToLocalStorage(activeWood);
    this.store.patch({ activeWood: activeWood });
  }

  /**
   * Saves active Wood to active Report.
   * Then sets active Wood to null.
   */
  public saveActiveWood(): void {
    if (!this.store.state.activeReport) {
      throw new ReportFailure("No hay Report activo.");
    }

    if (!this.store.state.activeWood) {
      throw new ReportFailure("No hay un Wood activo.");
    }

    const woods = this.store.state.activeReport.woods;
    const wood = this.store.state.activeWood;
    woods.push(wood);

    this.patchActiveReport({
      ...this.store.state.activeReport,
      woods: woods,
    });

    this.patchActiveWood(null);
  }

  /**
   * Removes a Wood from active Report "woods" field, given its index.
   *
   * @param index
   */
  public removeWoodFromActiveReport(index: number): void {
    if (!this.store.state.activeReport) {
      throw new ReportFailure("No hay reporte activo.");
    }

    const woods = this.store.state.activeReport.woods;
    woods.splice(index, 1);
    this.patchActiveReport({
      ...this.store.state.activeReport,
      woods: woods,
    });
  }

  /**
   * Process active report to generate pdf and xls files.
   * Then saves it to state into reports field.
   * Then sets active Report to null.
   */
  public saveActiveReport(): void {
    if (!this.store.state.activeReport) {
      throw new ReportFailure("No hay reporte activo.");
    }

    /**
     * @todo @mario Implementar generación de archivos.
     */

    // Add new report to beginning of reports array.
    const reports = this.store.state.reports;
    reports.unshift(this.store.state.activeReport);
    this.store.patch({
      reports: reports,
    });
    this.patchActiveReport(null);
  }

  /**
   * Retrieves created Reports from localStorage.
   */
  private fetchReportsFromLocalStorage(): WtReport[] {
    const localStorageReports =
      this.localStorage.fetch<LocalStorageWtReport[]>(REPORTS_LS_KEY);
    return localStorageReports
      ? localStorageReports.map((report) => this.reportFromLocalStorage(report))
      : [];
  }

  /**
   * Saves a WtReport to the active Report in localStorage.
   *
   * @param report
   */
  private saveActiveRerportToLocalStorage(report: WtReport | null): void {
    const reportToBeSaved = report ? this.reportToLocalStorage(report) : null;
    this.localStorage.save<LocalStorageWtReport>(
      ACTIVE_REPORT_LS_KEY,
      reportToBeSaved
    );
  }

  /**
   * Retrieves the active Report from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  private fetchActiveReportFromLocalStorage(): WtReport | null {
    const localStorageReport =
      this.localStorage.fetch<LocalStorageWtReport>(ACTIVE_REPORT_LS_KEY);
    return this.reportFromLocalStorage(localStorageReport);
  }

  /**
   * Transforms WtReport to localStorage apporpriate format (avoid losing Timestamps).
   *
   * @param report
   * @returns
   */
  private reportToLocalStorage(report: WtReport): LocalStorageWtReport {
    return {
      id: report.id,
      localId: report.localId,
      placa: report.placa,
      guia: report.guia,
      woods: report.woods.map((wood) => this.woodService.toLocalStorage(wood)),
      localPathXls: report.localPathXls,
      pathXls: report.pathXls,
      urlXls: report.urlXls,
      localPathPdf: report.localPathPdf,
      pathPdf: report.pathPdf,
      urlPdf: report.urlPdf,
      wtUserId: report.wtUserId,
      fCreado: {
        seconds: (report.fCreado as Timestamp).seconds,
        nanoseconds: (report.fCreado as Timestamp).nanoseconds,
      },
      fModificado: {
        seconds: (report.fModificado as Timestamp).seconds,
        nanoseconds: (report.fModificado as Timestamp).nanoseconds,
      },
    };
  }

  /**
   * Transforms a LocastorageWtReport from localStorage to apporpriate WtReport format
   * (reconstruct Timestamps).
   *
   * @param localStorageWtReport
   * @returns WtReport | null
   */
  private reportFromLocalStorage(
    localStorageWtReport: LocalStorageWtReport | null
  ): WtReport | null {
    return localStorageWtReport
      ? {
          id: localStorageWtReport.id,
          localId: localStorageWtReport.localId,
          placa: localStorageWtReport.placa,
          guia: localStorageWtReport.guia,
          woods: localStorageWtReport.woods.map((wood) =>
            this.woodService.fromLocalStorage(wood)
          ),
          localPathXls: localStorageWtReport.localPathXls,
          pathXls: localStorageWtReport.pathXls,
          urlXls: localStorageWtReport.urlXls,
          localPathPdf: localStorageWtReport.localPathPdf,
          pathPdf: localStorageWtReport.pathPdf,
          urlPdf: localStorageWtReport.urlPdf,
          wtUserId: localStorageWtReport.wtUserId,
          fCreado: new Timestamp(
            localStorageWtReport.fCreado.seconds,
            localStorageWtReport.fCreado.nanoseconds
          ),
          fModificado: new Timestamp(
            localStorageWtReport.fModificado.seconds,
            localStorageWtReport.fModificado.nanoseconds
          ),
        }
      : null;
  }
}