import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AnalysisListPage } from "./analysis-list.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisListPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisListPageRoutingModule {}
