import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { WtReport } from "src/app/models/wt-report";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"],
})
export class ReportsPage implements OnInit {
  busqueda = new FormControl("", []);

  public reports$: Observable<WtReport[]>;

  constructor(
    private reportService: ReportService,
    private utilsSvc: UtilsService
  ) {
    this.reports$ = this.reportService.reports;
  }

  ngOnInit() {}

  onViewReport(report: WtReport) {
    this.reportService.patchActiveReport(report);
    this.utilsSvc.routerLink("/tabs/reports/report-details");
  }

  onDawnloadReport(index: number) {
    this.utilsSvc.presentToast(
      "Esta funcionalidad está pendiente por desarrollar."
    );
  }
}
