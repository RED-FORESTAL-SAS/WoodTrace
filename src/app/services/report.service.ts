import { Injectable, OnDestroy } from "@angular/core";
import {
  LocalStorageWtReport,
  NEW_WT_REPORT,
  WtReport,
} from "../models/wt-report";
import { WoodService } from "./wood.service";
import { Timestamp } from "../types/timestamp.type";
import { ACTIVE_REPORT_LS_KEY } from "../constants/active-report-ls-key.constant";
import { UserService } from "./user.service";
import { ReportStore } from "../state/report.store";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map, skipWhile, take, tap, withLatestFrom } from "rxjs/operators";
import { NEW_WT_WOOD, WtWood } from "../models/wt-wood";
import { Failure, FailureUtils } from "../utils/failure.utils";
import { REPORTS_LS_KEY } from "../constants/reports-ls-key.constant";
import { AiFailure, AiService } from "./ai.service";
import { PdfService } from "./pdf.service";
import { PersonaType } from "src/assets/data/persona-types";
import { IonicLocalStorageRepository } from "../infrastructure/ionic-local-storage.repository";
import { FirebaseService } from "./firebase.service";
import { WtUser } from "../models/wt-user";

/**
 * Failure for Report Domain.
 */
export class ReportFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class ReportService implements OnDestroy {
  private sbs: Subscription[] = [];

  /// BehaviourSubject to trigger nextPage event.
  private nextReportPage = new BehaviorSubject<null | number>(null);

  constructor(
    private localStorage: IonicLocalStorageRepository,
    private store: ReportStore,
    private userService: UserService,
    private woodService: WoodService,
    private aiService: AiService,
    private pdfService: PdfService,
    private firebase: FirebaseService
  ) {
    this.init();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  private async init(): Promise<void> {
    await this.localStorage.init();
    const activeReport = await this.fetchActiveReportFromLocalStorage();
    const reports = await this.fetchReportsFromLocalStorage();
    // Initialize active report with value from localStorage, if any, or null.
    // Inicialize reports with value from localStorage, if any, or empty array.
    this.store.patch({
      activeReport: activeReport,
      reports: reports,
      /**
       * @todo @mario Determinar que pasa con el campo 'isFirstReport' en el ReportState y
       * eliminarlo si es el caso.
       */
      // isFirstReport: this.fetchIsFirstReportFromLocalStorage(),
    });

    // Intentar solicitar la primera página de Reports del servidor.
    this.initReportsPagination();
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
   * Getter for loadingReports from state.
   */
  get loadingReports(): Observable<boolean> {
    return this.store.state$.pipe(map((state) => state.loadingReports));
  }

  /**
   * Getter for error from state.
   */
  get error(): Observable<Failure | null> {
    return this.store.state$.pipe(map((state) => state.error));
  }

  /**
   * Cleans the error from state.
   */
  cleanError(): void {
    this.store.patch({ error: null });
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

    const reports = [...this.store.state.reports];

    // Generate pdf report and add new report to beginning of reports array in LocalStorage.
    const pdfReportDataUrl = await this.pdfService.buildReportPdf(
      activeReport,
      user,
      company,
      true
    );

    const newReport = {
      ...this.store.state.activeReport,
      urlPdf: pdfReportDataUrl,
    };

    reports.unshift(newReport);

    this.store.patch({
      reports: reports,
    });

    await this.saveReportToLocalStorage(newReport);

    // Clean active report.
    this.patchActiveReport(null);
  }

  /**
   * Syncs Reports from localStorage to Firestore.
   */
  public async syncReport(report: WtReport): Promise<void> {
    // Reject a Report if it was already synced.
    if (report.synced === true) return;

    // Keep report/woods original data to upload files later.
    let localReport = { ...report };
    const localWoods = [...report.woods];

    // Create report in Firestore.
    const reportData = {
      ...report,
      urlPdf: "",
      woods: localWoods.map((wood) => ({ ...wood, url: "" })),
    };

    // Only create report if it wasn´t already created.
    let id = report.id;
    if (id === "0") {
      const createdReportRef = await this.firebase
        .create(REPORTS_LS_KEY, reportData)
        .catch((e) => {
          /**
           * @todo @mario Manejar apropiadamente los errores.
           */
          console.log(e);
          throw e;
        });

      id = createdReportRef.id;

      // Update id in localStorageReport in case something fails later.
      localReport.id = id;
      await this.saveReportToLocalStorage(localReport);
    }

    // Upload pdf file. If it fails, process should be aborted silently.
    const uploadedReportPdfUrl = await this.firebase.uploadDataUrlToStorage(
      localReport.urlPdf,
      `wt-reports/${id}`,
      "report"
    );

    /**
     * @todo @mario Modificar cómo se sube el pdf. Cuando se sube como uploaDataUrl, se descuadra.
     * Intentar guardando el archivo y subiendolo a ver si así.
     */

    console.log(`🛫 PDF subido al storage wt-reports/${id}`);

    // Upload photos for each wood. If it fails, process should be aborted silently.
    const uploadedWoods = [];
    for (const wood of localWoods) {
      const uploadedWoodPhotoUrl = await this.firebase.uploadDataUrlToStorage(
        wood.url,
        `wt-reports/${id}`,
        `wood_${wood.localId}`
      );
      uploadedWoods.push({ ...wood, url: uploadedWoodPhotoUrl });
    }

    console.log(`🛫 Fotos de los Woods subidos al storage wt-reports/${id}`);

    // Update report with uploaded files urls. If succeeds, we can mark localStorageReport as synced.
    await this.firebase.update<WtReport>(`${REPORTS_LS_KEY}/${id}`, {
      urlPdf: uploadedReportPdfUrl,
      woods: uploadedWoods,
      synced: true,
    });

    // Mark localStorage Report as synced.
    localReport.synced = true;
    await this.saveReportToLocalStorage(localReport);

    // Update state with synced report.
    const reports = [...this.store.state.reports];
    const reportIndexInState = reports.findIndex(
      (r) => r.localId === report.localId
    );
    reports[reportIndexInState] = localReport;
    this.store.patch({
      reports,
    });

    console.log(
      `✅ Reporte ${report.localId} sincronizado en Firestore con el id ${id}.`
    );
  }

  /**
   * Triggers the fetch of the next page of Reports from the server.
   */
  public fetchNextReportPage(): void {
    this.store.patch({ loadingReports: true });
    this.nextReportPage.next(Date.now());
  }

  /**
   * Initializes the pagination of Reports from the server.
   */
  public async initReportsPagination(): Promise<void> {
    this.nextReportPage
      .asObservable()
      .pipe(
        skipWhile((v) => v === null),
        withLatestFrom(this.userService.user),
        withLatestFrom(this.reports),
        map(
          ([[page, user], reports]) => [user, reports] as [WtUser, WtReport[]]
        ),
        tap({
          next: async ([user, reports]) => {
            /// Get cursor from last Report in state.reports (for startAfter query).
            let cursorId = null;
            const createdReports = reports.filter((r) => r.id !== "0");
            if (createdReports.length > 0) {
              cursorId = createdReports[createdReports.length - 1].id;
            }

            /// Fetch a page of reports.
            const reportPageOrFailure = await this.firebase
              .fetchPage<WtReport>(user.id, REPORTS_LS_KEY, cursorId, 5)
              .catch((e: unknown) => {
                const failure = FailureUtils.errorToFailure(e);
                FailureUtils.log(failure);

                /**
                 * @dev Es posible que ocurra un NotFoundFailure, cuando el cursor no exista. Pero,
                 * a partir de las premisas, los reports no deberían ser eliminados, así que no se
                 * verifica este error.
                 *
                 * En caso de que sea necesario manejarlo, la opción es reintentar con el penúltimo
                 * cursor y así sucesivamente hasta que cargue la página como es.
                 */
                return failure;
              });

            if (reportPageOrFailure instanceof Failure) {
              this.store.patch({
                loadingReports: false,
                error: reportPageOrFailure,
              });
              return;
            }

            /**
             * @todo @mario Es necesario descargar y convertir las fotos y los pdfs de cada reporte
             * a DataUrls para que se puedan mostrar en la app. Esto es necesario hacerlo aquí para
             * que puedan estar disponibles cuando el dispositivo esté offline.
             *
             * @todo @mario En que momento se limitaría/eliminarían los reportes qu esobrepasen el
             * humbral de reportes disponibles offline?
             */

            // Update reports in state if localId is the same. Otherwise append.
            const allReports = [...reports];
            const newReports = [];
            for (const report of reportPageOrFailure) {
              const existingReportIndex = reports.findIndex(
                (r) => r.localId === report.localId // r.id === report.id
              );
              if (existingReportIndex !== -1) {
                allReports[existingReportIndex] = report;
              } else {
                newReports.push(report);
              }
            }

            // Patch store with retrieved reports.
            this.store.patch({
              reports: [...allReports, ...newReports],
              loadingReports: false,
            });

            // Save new incomming reports to localStorage.
            for (const lsReport of newReports) {
              await this.saveReportToLocalStorage(lsReport);
            }
          },
        })
      )
      .subscribe();
  }

  /**
   * Retrieves created Reports from localStorage.
   */
  private async fetchReportsFromLocalStorage(): Promise<WtReport[]> {
    const reportsKeys = await this.localStorage.fetch<string[]>(REPORTS_LS_KEY);

    if (reportsKeys === null) {
      return [];
    }

    const promises: Promise<WtReport>[] = [];
    for (const key of reportsKeys) {
      promises.push(
        this.localStorage
          .fetch<LocalStorageWtReport>(key)
          .then((r) => this.reportFromLocalStorage(r))
      );
    }

    const reports = await Promise.all(promises);
    return reports;
  }

  /**
   * Saves a WtReport to localStorage with 'localId' as its key.
   *
   * @param report
   */
  private async saveReportToLocalStorage(report: WtReport): Promise<void> {
    const reportsKeys = await this.localStorage.fetch<string[]>(REPORTS_LS_KEY);
    const addedReportsKeys = [report.localId, ...(reportsKeys ?? [])];
    const uniqueReportKeys = addedReportsKeys.filter(
      (item, pos) => addedReportsKeys.indexOf(item) === pos
    );

    const localStorageReport = this.reportToLocalStorage(report);

    const promises: Promise<void>[] = [
      this.localStorage.save<string[]>(REPORTS_LS_KEY, uniqueReportKeys),
      this.localStorage.save<LocalStorageWtReport>(
        report.localId,
        localStorageReport
      ),
    ];

    await Promise.all(promises);
  }

  /**
   * Saves an Array of WtReports to localStorage.
   *
   * @param reports WtReport[]
   */
  private async saveReportsToLocalStorage(reports: WtReport[]): Promise<void> {
    const reportsKeys = reports.map((report) => report.localId);

    const promises: Promise<void>[] = [];
    for (const report of reports) {
      const localStorageReport = this.reportToLocalStorage(report);
      promises.push(
        this.localStorage.save<LocalStorageWtReport>(
          report.localId,
          localStorageReport
        )
      );
    }

    promises.push(
      this.localStorage.save<string[]>(REPORTS_LS_KEY, reportsKeys)
    );

    await Promise.all(promises);
  }

  /**
   * Removs a WtReport from localStorage.
   *
   * @param report
   */
  private async removeReportFromLocalStorage(report: WtReport): Promise<void> {
    const reportsKeys = await this.localStorage.fetch<string[]>(REPORTS_LS_KEY);
    const removedReportsKeys = reportsKeys.filter(
      (item) => item !== report.localId
    );

    const promises: Promise<void>[] = [
      this.localStorage.save<string[]>(REPORTS_LS_KEY, removedReportsKeys),
      this.localStorage.delete(report.localId),
    ];

    await Promise.all(promises);
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
  private async fetchActiveReportFromLocalStorage(): Promise<WtReport | null> {
    const localStorageReport =
      await this.localStorage.fetch<LocalStorageWtReport>(ACTIVE_REPORT_LS_KEY);
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
      synced: report.synced,
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
          synced: localStorageWtReport.synced,
        }
      : null;
  }
}
