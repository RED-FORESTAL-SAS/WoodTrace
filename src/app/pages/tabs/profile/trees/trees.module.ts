import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreesPageRoutingModule } from './trees-routing.module';

import { TreesPage } from './trees.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreesPageRoutingModule,
    SharedModule,
  ],
  declarations: [TreesPage]
})
export class TreesPageModule {}
