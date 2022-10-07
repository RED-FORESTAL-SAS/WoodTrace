import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnalysisResumenPageRoutingModule } from './analysis-resumen-routing.module';

import { AnalysisResumenPage } from './analysis-resumen.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnalysisResumenPageRoutingModule,
    SharedModule
  ],
  declarations: [AnalysisResumenPage]
})
export class AnalysisResumenPageModule {}
