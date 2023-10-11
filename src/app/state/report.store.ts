import { Injectable } from "@angular/core";
import { BaseStore } from "../core/state/base.store";
import { ReportState } from "./report.state";

/**
 * This class hold state for Active Report.
 */
@Injectable({
  providedIn: "root",
})
export class ReportStore extends BaseStore<ReportState> {
  public store = "active-report-store" + "-" + Date.now().toString().slice(-3);

  constructor() {
    super({
      activeReport: null,
      activeWood: null,
      reports: [],
      loadingReports: false,
      isFirstReport: true,
      error: null,
    });
  }
}
