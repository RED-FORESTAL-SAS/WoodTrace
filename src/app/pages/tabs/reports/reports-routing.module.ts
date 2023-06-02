import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ReportsPage } from "./reports.page";
import { ReportDetailsPage } from "./report-details/report-details.page";

const routes: Routes = [
  {
    path: "",
    component: ReportsPage,
  },
  {
    path: "report-details",
    component: ReportDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsPageRoutingModule {}
