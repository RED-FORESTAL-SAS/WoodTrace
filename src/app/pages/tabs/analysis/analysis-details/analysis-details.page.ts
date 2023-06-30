import { Component } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-analysis-details",
  templateUrl: "./analysis-details.page.html",
  styleUrls: ["./analysis-details.page.scss"],
})
export class AnalysisDetailsPage {
  constructor(private utilsSvc: UtilsService) {}

  onVolver() {
    this.utilsSvc.routerLink("/tabs/analysis/analysis-list");
  }
}
