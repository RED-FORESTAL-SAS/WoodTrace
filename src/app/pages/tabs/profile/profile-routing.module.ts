import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ProfilePage } from "./profile.page";

const routes: Routes = [
  {
    path: "",
    component: ProfilePage,
  },
  {
    path: "membership",
    loadChildren: () =>
      import("./membership/membership.module").then(
        (m) => m.MembershipPageModule
      ),
  },
  {
    path: "help",
    loadChildren: () =>
      import("./help/help.module").then((m) => m.HelpPageModule),
  },
  {
    path: "terms-and-conditions",
    loadChildren: () =>
      import("./terms-and-conditions/terms-and-conditions.module").then(
        (m) => m.TermsAndConditionsPageModule
      ),
  },
  {
    path: "privacy-policies",
    loadChildren: () =>
      import("./privacy-policies/privacy-policies.module").then(
        (m) => m.PrivacyPoliciesPageModule
      ),
  },
  {
    path: "admin-account",
    loadChildren: () =>
      import("./admin-account/admin-account.module").then(
        (m) => m.AdminAccountPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
