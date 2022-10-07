import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HowToUsePageRoutingModule } from './how-to-use-routing.module';

import { HowToUsePage } from './how-to-use.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HowToUsePageRoutingModule,
    SharedModule
  ],
  declarations: [HowToUsePage]
})
export class HowToUsePageModule {}
