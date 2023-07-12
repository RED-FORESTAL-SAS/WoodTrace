import { Component } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-report-analysis-details",
  templateUrl: "./report-analysis-details.page.html",
  styleUrls: ["./report-analysis-details.page.scss"],
})
export class ReportAnalysisDetailsPage {
  constructor(private utilsSvc: UtilsService) {}

  onVolver() {
    this.utilsSvc.routerLink("/tabs/reports/report-details");
  }
}
