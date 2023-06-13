import { WtReport } from "../models/wt-report";
import { WtWood } from "../models/wt-wood";

/**
 * Describes the state of the active Report.
 *
 * Active report could be null, if no report is active. Or could be a WtReport, if user is creating
 * a report.
 */
export interface ReportState {
  /**
   * Active Report that user is creating.
   */
  activeReport: WtReport | null;

  /**
   * Active Wood that user is creating.
   */
  activeWood: WtWood | null;

  /**
   * Reports created/syncronized with Firestore.
   */
  reports: WtReport[];

  /**
   * Bandera para mostrar el help del reporte ...
   */
  isFirstReport: boolean;
}
