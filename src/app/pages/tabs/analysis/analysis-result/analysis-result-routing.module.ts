import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisResultPage } from "./analysis-result.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisResultPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisResultPageRoutingModule {}
