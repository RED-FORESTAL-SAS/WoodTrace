import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TabsPageRoutingModule } from "./tabs-routing.module";

import { TabsPage } from "./tabs.page";
import { TimeStampPipe } from "src/app/shared/components/pipes/timestamp.pipe";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TabsPageRoutingModule],
  declarations: [TabsPage],
})
export class TabsPageModule {}
