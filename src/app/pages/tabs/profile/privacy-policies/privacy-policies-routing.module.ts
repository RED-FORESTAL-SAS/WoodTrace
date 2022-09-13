import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivacyPoliciesPage } from './privacy-policies.page';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPoliciesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivacyPoliciesPageRoutingModule {}
