import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OperatorsPageRoutingModule } from './operators-routing.module';

import { OperatorsPage } from './operators.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OperatorsPageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [OperatorsPage]
})
export class OperatorsPageModule {}
