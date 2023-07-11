import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { MembershipPageRoutingModule } from "./membership-routing.module";

import { MembershipPage } from "./membership.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembershipPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  declarations: [MembershipPage],
})
export class MembershipPageModule {}
