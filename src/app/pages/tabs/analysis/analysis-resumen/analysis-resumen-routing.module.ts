import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisResumenPage } from "./analysis-resumen.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisResumenPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisResumenPageRoutingModule {}
