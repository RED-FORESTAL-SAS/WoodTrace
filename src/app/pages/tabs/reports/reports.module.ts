import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ReportsPageRoutingModule } from "./reports-routing.module";

import { ReportsPage } from "./reports.page";
import { SharedModule } from "src/app/shared/shared.module";
import { ReportDetailsPage } from "./report-details/report-details.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsPageRoutingModule,
    SharedModule,
  ],
  declarations: [ReportsPage, ReportDetailsPage],
})
export class ReportsPageModule {}
