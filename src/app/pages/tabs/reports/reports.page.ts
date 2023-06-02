import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { WtReport } from "src/app/models/wt-report";
import { FirebaseService } from "src/app/services/firebase.service";
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

  private sbs: Subscription[] = [];

  constructor(
    private reportService: ReportService,
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService
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
