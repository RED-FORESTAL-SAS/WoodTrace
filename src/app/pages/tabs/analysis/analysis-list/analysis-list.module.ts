import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisListPageRoutingModule } from "./analysis-list-routing.module";

import { AnalysisListPage } from "./analysis-list.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisListPageRoutingModule,
    SharedModule,
  ],
  declarations: [AnalysisListPage],
})
export class AnalysisListPageModule {}
