import { Injectable } from "@angular/core";
import { UtilsService } from "./utils.service";
import { LocalstorageWtReport, WtReport } from "../models/wt-report";
import { WoodService } from "./wood.service";
import { Timestamp } from "../types/timestamp.type";

@Injectable({
  providedIn: "root",
})
export class LicenseService {
  constructor(private utils: UtilsService, private woodService: WoodService) {}

  retrieveActiveReport() {
    /**
     * @todo @mario
     */
  }

  /**
   * Transforms WtReport to localstorage apporpriate format (avoid losing Timestamps).
   * @param report
   * @returns
   */
  toLocalStorage(report: WtReport): LocalstorageWtReport {
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
   * Transforms a LocastorageWtReport from localstorage to apporpriate WtReport format
   * (reconstruct Timestamps).
   *
   * @param localstorageWtReport
   * @returns
   */
  fromLocalStorage(
    localstorageWtReport: LocalstorageWtReport | null
  ): WtReport | null {
    return localstorageWtReport
      ? {
          id: localstorageWtReport.id,
          localId: localstorageWtReport.localId,
          placa: localstorageWtReport.placa,
          guia: localstorageWtReport.guia,
          woods: localstorageWtReport.woods.map((wood) =>
            this.woodService.fromLocalStorage(wood)
          ),
          localPathXls: localstorageWtReport.localPathXls,
          pathXls: localstorageWtReport.pathXls,
          urlXls: localstorageWtReport.urlXls,
          localPathPdf: localstorageWtReport.localPathPdf,
          pathPdf: localstorageWtReport.pathPdf,
          urlPdf: localstorageWtReport.urlPdf,
          wtUserId: localstorageWtReport.wtUserId,
          fCreado: new Timestamp(
            localstorageWtReport.fCreado.seconds,
            localstorageWtReport.fCreado.nanoseconds
          ),
          fModificado: new Timestamp(
            localstorageWtReport.fModificado.seconds,
            localstorageWtReport.fModificado.nanoseconds
          ),
        }
      : null;
  }
}
