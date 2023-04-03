import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AnalysisHelpComponent } from "./components/analysis-help/analysis-help.component";
import { HelpDeskComponent } from "./components/help-desk/help-desk.component";
import { ImplementsComponent } from "./components/implements/implements.component";

import { HelpPage } from "./help.page";
import { ReportHelpComponent } from "./components/report-help/report-help.component";

const routes: Routes = [
  {
    path: "",
    component: HelpPage,
  },
  {
    path: "help-desk",
    component: HelpDeskComponent,
  },
  {
    path: "implements",
    component: ImplementsComponent,
  },
  {
    path: "analysis-help",
    component: AnalysisHelpComponent,
  },
  {
    path: "report-help",
    component: ReportHelpComponent,
  },
  {
    path: "contact-info",
    loadChildren: () =>
      import("../terms-and-conditions/terms-and-conditions.module").then(
        (m) => m.TermsAndConditionsPageModule
      ),
  },
  {
    path: "terms-and-conditions",
    loadChildren: () =>
      import("../terms-and-conditions/terms-and-conditions.module").then(
        (m) => m.TermsAndConditionsPageModule
      ),
  },
  {
    path: "privacy-policies",
    loadChildren: () =>
      import("../privacy-policies/privacy-policies.module").then(
        (m) => m.PrivacyPoliciesPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpPageRoutingModule {}
