import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminAccountPageRoutingModule } from './admin-account-routing.module';

import { AdminAccountPage } from './admin-account.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminAccountPageRoutingModule,
    SharedModule
  ],
  declarations: [AdminAccountPage]
})
export class AdminAccountPageModule {}
