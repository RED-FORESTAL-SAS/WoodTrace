import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { PrivacyPoliciesPageRoutingModule } from "./privacy-policies-routing.module";

import { PrivacyPoliciesPage } from "./privacy-policies.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivacyPoliciesPageRoutingModule,
    SharedModule,
  ],
  declarations: [PrivacyPoliciesPage],
})
export class PrivacyPoliciesPageModule {}
