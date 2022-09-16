import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { InputGradientComponent } from './components/input-gradient/input-gradient.component';
import { LogoComponent } from './components/logo/logo.component';
import { HelpSliderComponent } from './components/help-slider/help-slider.component';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  declarations: [
    HeaderComponent,
    InputGradientComponent,
    LogoComponent,
    HelpSliderComponent
  ],
  exports: [
    HeaderComponent,
    InputGradientComponent,
    LogoComponent,
    HelpSliderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SwiperModule
  ]
})
export class SharedModule { }
