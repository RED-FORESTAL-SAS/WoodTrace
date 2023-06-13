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

  /**
   * @todo @diana Poner en false antes de tirar a producción.
   */
  protected override debug = true;

  constructor() {
    super({
      activeReport: null,
      activeWood: null,
      reports: [],
      isFirstReport: true,
    });
  }
}
