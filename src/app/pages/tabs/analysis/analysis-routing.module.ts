import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnalysisPage } from './analysis.page';

const routes: Routes = [
  {
    path: '',
    component: AnalysisPage
  },
  {
    path: 'analysis-form',
    loadChildren: () => import('./analysis-form/analysis-form.module').then( m => m.AnalysisFormPageModule)
  },
  {
    path: 'how-to-use',
    loadChildren: () => import('./how-to-use/how-to-use.module').then( m => m.HowToUsePageModule)
  },
  {
    path: 'take-photos',
    loadChildren: () => import('./take-photos/take-photos.module').then( m => m.TakePhotosPageModule)
  },
  {
    path: 'analysis-resumen',
    loadChildren: () => import('./analysis-resumen/analysis-resumen.module').then( m => m.AnalysisResumenPageModule)
  },
  {
    path: 'analysis-trees',
    loadChildren: () => import('./analysis-trees/analysis-trees.module').then( m => m.AnalysisTreesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisPageRoutingModule {}
