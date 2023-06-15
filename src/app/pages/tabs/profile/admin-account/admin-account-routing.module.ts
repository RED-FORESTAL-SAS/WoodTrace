import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AdminAccountPage } from "./admin-account.page";

const routes: Routes = [
  {
    path: "",
    component: AdminAccountPage,
  },
  {
    path: "owner",
    loadChildren: () =>
      import("./owner/owner.module").then((m) => m.OwnerPageModule),
  },
  {
    path: "company",
    loadChildren: () =>
      import("./company/company.module").then((m) => m.CompanyPageModule),
  },
  {
    path: "operators",
    loadChildren: () =>
      import("./operators/operators.module").then((m) => m.OperatorsPageModule),
  },
  {
    path: "properties",
    loadChildren: () =>
      import("./properties/properties.module").then(
        (m) => m.PropertiesPageModule
      ),
  },
  {
    path: "devices",
    loadChildren: () =>
      import("./devices/devices.module").then((m) => m.DevicesPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAccountPageRoutingModule {}
