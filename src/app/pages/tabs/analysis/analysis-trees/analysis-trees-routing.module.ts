import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnalysisTreesPage } from './analysis-trees.page';

const routes: Routes = [
  {
    path: '',
    component: AnalysisTreesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalysisTreesPageRoutingModule {}
