import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisDetailsPageRoutingModule } from "./analysis-details-routing.module";

import { AnalysisDetailsPage } from "./analysis-details.page";
import { SharedModule } from "src/app/shared/shared.module";
import { AnalysisResultPageModule } from "../analysis-result/analysis-result.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisDetailsPageRoutingModule,
    SharedModule,
    AnalysisResultPageModule,
  ],
  declarations: [AnalysisDetailsPage],
})
export class AnalysisDetailsPageModule {}
