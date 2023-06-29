import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ReportsPage } from "./reports.page";
import { ReportDetailsPage } from "./report-details/report-details.page";
import { ReportAnalysisDetailsPage } from "./report-analysis-details/report-analysis-details.page";

const routes: Routes = [
  {
    path: "",
    component: ReportsPage,
  },
  {
    path: "report-details",
    component: ReportDetailsPage,
  },
  {
    path: "report-analysis-details",
    component: ReportAnalysisDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsPageRoutingModule {}
