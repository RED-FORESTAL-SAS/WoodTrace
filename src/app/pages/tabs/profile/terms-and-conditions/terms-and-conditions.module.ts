import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TermsAndConditionsPageRoutingModule } from "./terms-and-conditions-routing.module";

import { TermsAndConditionsPage } from "./terms-and-conditions.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsAndConditionsPageRoutingModule,
    SharedModule,
  ],
  declarations: [TermsAndConditionsPage],
})
export class TermsAndConditionsPageModule {}
