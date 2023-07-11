import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AnalysisFormPageRoutingModule } from "./analysis-form-routing.module";

import { AnalysisFormPage } from "./analysis-form.page";
import { SharedModule } from "src/app/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisFormPageRoutingModule,
    SharedModule,
  ],
  declarations: [AnalysisFormPage],
})
export class AnalysisFormPageModule {}
