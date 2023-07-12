import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisFormPage } from "./analysis-form.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisFormPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisFormPageRoutingModule {}
