import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "",
    component: TabsPage,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "analysis",
      },
      {
        path: "profile",
        loadChildren: () =>
          import("./profile/profile.module").then((m) => m.ProfilePageModule),
      },
      {
        path: "analysis",
        loadChildren: () =>
          import("./analysis/analysis.module").then(
            (m) => m.AnalysisPageModule
          ),
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./reports/reports.module").then((m) => m.ReportsPageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
