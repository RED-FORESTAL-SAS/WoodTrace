import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisDetailsPage } from "./analysis-details.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisDetailsPageRoutingModule {}
