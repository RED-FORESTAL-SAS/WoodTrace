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
import { map, take } from "rxjs/operators";
import { NEW_WT_WOOD, WtWood } from "../models/wt-wood";
import { Failure } from "../utils/failure.utils";
import { REPORTS_LS_KEY } from "../constants/reports-ls-key.constant";
import { AiFailure, AiService } from "./ai.service";
import { PdfService } from "./pdf.service";
import { PersonaType } from "src/assets/data/persona-types";

/**
 * Failure for Report Domain.
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
    private woodService: WoodService,
    private aiService: AiService,
    private pdfService: PdfService
  ) {
    // Initialize active report with value from localStorage, if any, or null.
    // Inicialize reports with value from localStorage, if any, or empty array.
    this.store.patch({
      activeReport: this.fetchActiveReportFromLocalStorage(),
      reports: this.fetchReportsFromLocalStorage(),
      // isFirstReport: this.fetchIsFirstReportFromLocalStorage(),
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
   * Returns a new empty Wood.
   *
   * @param user
   * @returns
   */
  get emptyWood(): WtWood {
    return {
      ...NEW_WT_WOOD,
      localId: "0",
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
   * Envía el Wood activo para que sea analizado por la AI y actualiza su estado de la aplicación,
   * con el resultado del análisis.
   *
   * @throws ReportFailure. El resultado solo puede ser exitoso o fallar. Por eso solo se indica un
   * error en caso de falla.
   */
  async analyzeWood(): Promise<void> {
    if (!this.store.state.activeWood) {
      throw new ReportFailure("No hay un Wood activo.");
    }

    try {
      const analayzedWood = await this.aiService.withRemoteImage(
        this.store.state.activeWood
      );
      this.patchActiveWood(analayzedWood);
    } catch (e) {
      throw new ReportFailure("Error al analizar la muestra.", e.code, e);
    }
  }

  /**
   * Permite analizar un Wood, pero con un delay de 5 segundos para simular un error.
   *
   * @throws ReportFailure.
   *
   * @todo @mario Eliminar este método cuando se implemente la AI.
   */
  async analayzedWoodWithFailure(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    throw new ReportFailure(
      "Error al analizar la muestra.",
      "mock-error",
      new AiFailure("mock-error", "mock-error", "mock-error")
    );
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
    wood.localId = new Date().getTime().toString();
    const findWood = woods.find((w) => w.localId === wood.localId);
    if (findWood === undefined) {
      woods.push(wood);

      this.patchActiveReport({
        ...this.store.state.activeReport,
        woods: woods,
      });
    }

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
  public async saveActiveReport(): Promise<void> {
    const activeReport = await this.activeReport.pipe(take(1)).toPromise();
    const user = await this.userService.user.pipe(take(1)).toPromise();
    const company = await this.userService.company.pipe(take(1)).toPromise();

    if (!activeReport) {
      throw new ReportFailure("No hay reporte activo.");
    }

    /**
     * @todo @mario Implementar generación de archivos.
     */

    this.pdfService.buildDoc(activeReport, user, company);
    return;

    /**
     * @todo @mario A partir de aquí es el guardado.
     */

    // Add new report to beginning of reports array.
    const reports = this.store.state.reports;
    reports.unshift(this.store.state.activeReport);
    this.store.patch({
      reports: reports,
    });

    // Save reports to localStorage.
    this.saveReportsToLocalStorage(reports);

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
   * Saves an Array of WtReports to localStorage.
   *
   * @param reports WtReport[]
   */
  private saveReportsToLocalStorage(reports: WtReport[]): void {
    const localStorageReports = reports.map((report) =>
      this.reportToLocalStorage(report)
    );
    this.localStorage.save<LocalStorageWtReport[]>(
      REPORTS_LS_KEY,
      localStorageReports
    );
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
      personaType: report.personaType,
      fullName: report.fullName,
      docType: report.docType,
      docNumber: report.docNumber,
      placa: report.placa,
      guia: report.guia,
      departamento: report.departamento,
      municipio: report.municipio,
      ubicacion: report.ubicacion,
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
          personaType: localStorageWtReport.personaType as PersonaType,
          fullName: localStorageWtReport.fullName,
          docType: localStorageWtReport.docType,
          docNumber: localStorageWtReport.docNumber,
          guia: localStorageWtReport.guia,
          departamento: localStorageWtReport.departamento,
          municipio: localStorageWtReport.municipio,
          ubicacion: localStorageWtReport.ubicacion,
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
