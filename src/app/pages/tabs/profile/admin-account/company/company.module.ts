import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CompanyPageRoutingModule } from "./company-routing.module";

import { CompanyPage } from "./company.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompanyPageRoutingModule,
    SharedModule,
  ],
  declarations: [CompanyPage],
})
export class CompanyPageModule {}
