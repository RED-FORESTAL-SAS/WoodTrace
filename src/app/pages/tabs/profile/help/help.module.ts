import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { HelpPageRoutingModule } from "./help-routing.module";

import { HelpPage } from "./help.page";
import { SharedModule } from "src/app/shared/shared.module";
import { HelpDeskComponent } from "./components/help-desk/help-desk.component";
import { ImplementsComponent } from "./components/implements/implements.component";
import { AnalysisHelpComponent } from "./components/analysis-help/analysis-help.component";
import { ReportHelpComponent } from "./components/report-help/report-help.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HelpPageRoutingModule,
    SharedModule,
  ],
  declarations: [
    HelpPage,
    HelpDeskComponent,
    ImplementsComponent,
    AnalysisHelpComponent,
    ReportHelpComponent,
  ],
})
export class HelpPageModule {}
