import { Component } from "@angular/core";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-analysis-result-content",
  templateUrl: "./analysis-result-content.page.html",
  styleUrls: ["./analysis-result-content.page.scss"],
})
export class AnalysisResultContentPage {
  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {}

  onRehacer() {
    this.reportService.patchActiveWood(this.reportService.emptyWood);
    this.utilsSvc.routerLink("/tabs/analysis/take-photos");
  }

  onGuardar() {
    this.reportService.saveActiveWood();
    this.utilsSvc.routerLink("/tabs/analysis/analysis-list");
  }
}
