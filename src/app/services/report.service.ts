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

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(
    private localStorage: LocalStorageRepository,
    private userService: UserService,
    private woodService: WoodService
  ) {}

  /**
   * @todo @mario Hacer funcionalidad para sincronizar los reportes locales con firestore.
   * @todo @mario Este reporte es responsable de manejar el datagrid.
   */

  /**
   * Returns a new empty Report, given a User.
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
   * Saves a WtReport to localStorage.
   *
   * @param report
   */
  saveToLocalStorage(report: WtReport | null): void {
    const reportToBeSaved = report ? this.toLocalStorage(report) : null;
    this.localStorage.save<LocalStorageWtReport>(
      ACTIVE_REPORT_LS_KEY,
      reportToBeSaved
    );
  }

  /**
   * Retrieves WtReport from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  fetchFromLocalStorage(): WtReport | null {
    const localStorageReport =
      this.localStorage.fetch<LocalStorageWtReport>(ACTIVE_REPORT_LS_KEY);
    return this.fromLocalStorage(localStorageReport);
  }

  /**
   * Transforms WtReport to localStorage apporpriate format (avoid losing Timestamps).
   *
   * @param report
   * @returns
   */
  toLocalStorage(report: WtReport): LocalStorageWtReport {
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
  fromLocalStorage(
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
