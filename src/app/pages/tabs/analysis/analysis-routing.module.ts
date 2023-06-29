import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AnalysisGuard } from "src/app/guards/analysis.guard";

import { AnalysisPage } from "./analysis.page";

const routes: Routes = [
  {
    path: "",
    component: AnalysisPage,
  },
  {
    path: "analysis-form",
    loadChildren: () =>
      import("./analysis-form/analysis-form.module").then(
        (m) => m.AnalysisFormPageModule
      ),
  },
  {
    path: "how-to-use",
    loadChildren: () =>
      import("./how-to-use/how-to-use.module").then(
        (m) => m.HowToUsePageModule
      ),
    // canActivate: [AnalysisGuard],
  },
  {
    path: "take-photos",
    loadChildren: () =>
      import("./take-photos/take-photos.module").then(
        (m) => m.TakePhotosPageModule
      ),
    // canActivate: [AnalysisGuard],
  },
  {
    path: "analysis-result",
    loadChildren: () =>
      import("./analysis-result/analysis-result.module").then(
        (m) => m.AnalysisResultPageModule
      ),
    // canActivate: [AnalysisGuard],
  },
  {
    path: "analysis-result-content",
    loadChildren: () =>
      import("./analysis-result-content/analysis-result-content.module").then(
        (m) => m.AnalysisResultContentPageModule
      ),
    // canActivate: [AnalysisGuard],
  },
  {
    path: "analysis-list",
    loadChildren: () =>
      import("./analysis-list/analysis-list.module").then(
        (m) => m.AnalysisListPageModule
      ),
    // canActivate: [AnalysisGuard],
  },
  {
    path: "analysis-details",
    loadChildren: () =>
      import("./analysis-details/analysis-details.module").then(
        (m) => m.AnalysisDetailsPageModule
      ),
    // canActivate: [AnalysisGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisPageRoutingModule {}
