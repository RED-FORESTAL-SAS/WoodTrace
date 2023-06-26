import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HeaderComponent } from "./components/header/header.component";
import { InputGradientComponent } from "./components/input-gradient/input-gradient.component";
import { InputCostumComponent } from "./components/input-costum/input-costum.component";
import { LogoComponent } from "./components/logo/logo.component";
import { HelpSliderComponent } from "./components/help-slider/help-slider.component";
import { SwiperModule } from "swiper/angular";
import { EmptyArrayComponent } from "./components/empty-array/empty-array.component";
import { PasswordRequiredComponent } from "./components/password-required/password-required.component";
import { FinkAlertComponent } from "./components/fink-alert/fink-alert.component";
import { DownloadTypeComponent } from "./components/download-type/download-type.component";
import { NgxCurrencyModule } from "ngx-currency";
import { TimeStampPipe } from "./components/pipes/timestamp.pipe";
import { EspecieModalComponent } from "./components/especie-modal/especie-modal.component";
import { LoadingModalComponent } from "./components/loading-modal/loading-modal.component";
import { ErrorModalComponent } from "./components/error-modal/error-modal.component";

@NgModule({
  declarations: [
    HeaderComponent,
    InputGradientComponent,
    InputCostumComponent,
    LogoComponent,
    HelpSliderComponent,
    EmptyArrayComponent,
    PasswordRequiredComponent,
    FinkAlertComponent,
    DownloadTypeComponent,
    EspecieModalComponent,
    LoadingModalComponent,
    ErrorModalComponent,
    TimeStampPipe,
  ],
  exports: [
    HeaderComponent,
    InputGradientComponent,
    InputCostumComponent,
    LogoComponent,
    HelpSliderComponent,
    EmptyArrayComponent,
    PasswordRequiredComponent,
    FinkAlertComponent,
    DownloadTypeComponent,
    EspecieModalComponent,
    LoadingModalComponent,
    ErrorModalComponent,
    TimeStampPipe,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SwiperModule,
    NgxCurrencyModule,
  ],
})
export class SharedModule {}
