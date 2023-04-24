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
    // canActivate: [AnalysisGuard]
  },
  {
    path: "take-photos",
    loadChildren: () =>
      import("./take-photos/take-photos.module").then(
        (m) => m.TakePhotosPageModule
      ),
    // canActivate: [AnalysisGuard]
  },
  {
    path: "analysis-resumen/:tree",
    loadChildren: () =>
      import("./analysis-resumen/analysis-resumen.module").then(
        (m) => m.AnalysisResumenPageModule
      ),
    // canActivate: [AnalysisGuard]
  },
  {
    path: "analysis-trees/:segment",
    loadChildren: () =>
      import("./analysis-trees/analysis-trees.module").then(
        (m) => m.AnalysisTreesPageModule
      ),
    // canActivate: [AnalysisGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisPageRoutingModule {}
