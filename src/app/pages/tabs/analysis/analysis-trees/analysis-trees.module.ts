import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisTreesPageRoutingModule } from "./analysis-trees-routing.module";

import { AnalysisTreesPage } from "./analysis-trees.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisTreesPageRoutingModule,
    SharedModule,
  ],
  declarations: [AnalysisTreesPage],
})
export class AnalysisTreesPageModule {}
