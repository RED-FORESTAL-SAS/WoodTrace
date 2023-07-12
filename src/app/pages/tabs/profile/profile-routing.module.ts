import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ProfilePage } from "./profile.page";

const routes: Routes = [
  {
    path: "",
    component: ProfilePage,
  },
  {
    path: "admin-account",
    loadChildren: () =>
      import("./admin-account/admin-account.module").then(
        (m) => m.AdminAccountPageModule
      ),
  },
  {
    path: "company",
    loadChildren: () =>
      import("./admin-account/company/company.module").then(
        (m) => m.CompanyPageModule
      ),
  },
  {
    path: "help",
    loadChildren: () =>
      import("./help/help.module").then((m) => m.HelpPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
