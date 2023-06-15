import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { OwnerPageRoutingModule } from "./owner-routing.module";

import { OwnerPage } from "./owner.page";
import { SharedModule } from "src/app/shared/shared.module";
import { UpdatePasswordComponent } from "./components/update-password/update-password.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OwnerPageRoutingModule,
    SharedModule,
  ],
  declarations: [OwnerPage, UpdatePasswordComponent],
})
export class OwnerPageModule {}
