import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AdminAccountPage } from "./admin-account.page";

const routes: Routes = [
  {
    path: "",
    component: AdminAccountPage,
  },
  {
    path: "membership",
    loadChildren: () =>
      import("../membership/membership.module").then(
        (m) => m.MembershipPageModule
      ),
  },
  {
    path: "owner",
    loadChildren: () =>
      import("./owner/owner.module").then((m) => m.OwnerPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminAccountPageRoutingModule {}
