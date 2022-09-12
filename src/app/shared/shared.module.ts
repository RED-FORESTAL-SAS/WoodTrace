import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { InputGradientComponent } from './components/input-gradient/input-gradient.component';
import { LogoComponent } from './components/logo/logo.component';


@NgModule({
  declarations: [
    HeaderComponent,
    InputGradientComponent,
    LogoComponent
  ],
  exports: [
    HeaderComponent,
    InputGradientComponent,
    LogoComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
