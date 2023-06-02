import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisResultPageRoutingModule } from "./analysis-result-routing.module";

import { AnalysisResultPage } from "./analysis-result.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisResultPageRoutingModule,
    SharedModule,
  ],
  declarations: [AnalysisResultPage],
})
export class AnalysisResultPageModule {}
