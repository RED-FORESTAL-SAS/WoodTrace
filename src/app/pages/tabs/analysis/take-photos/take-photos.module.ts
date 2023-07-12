import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TakePhotosPageRoutingModule } from "./take-photos-routing.module";

import { TakePhotosPage } from "./take-photos.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TakePhotosPageRoutingModule,
    SharedModule,
  ],
  declarations: [TakePhotosPage],
})
export class TakePhotosPageModule {}
