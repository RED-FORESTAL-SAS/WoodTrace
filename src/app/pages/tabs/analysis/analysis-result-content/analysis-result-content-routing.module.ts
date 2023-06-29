import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisResultContentPage } from "./analysis-result-content.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisResultContentPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisResultContentPageRoutingModule {}
