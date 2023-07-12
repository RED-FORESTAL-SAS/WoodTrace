import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisResultContentPage } from "./analysis-result-content.page";
import { SharedModule } from "src/app/shared/shared.module";
import { AnalysisResultContentPageRoutingModule } from "./analysis-result-content-routing.module";
import { AnalysisResultPageModule } from "../analysis-result/analysis-result.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisResultContentPageRoutingModule,
    SharedModule,
    AnalysisResultPageModule,
  ],

  declarations: [AnalysisResultContentPage],
})
export class AnalysisResultContentPageModule {}
