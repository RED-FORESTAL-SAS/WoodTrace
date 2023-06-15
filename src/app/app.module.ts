import { LOCALE_ID, NgModule } from "@angular/core";
import es from "@angular/common/locales/es";

import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";

// ========= Firebase ========
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";

import { environment } from "src/environments/environment";

// ======= Plugins =======
import { Device } from "@awesome-cordova-plugins/device/ngx";
import { CurrencyPipe, registerLocaleData } from "@angular/common";

registerLocaleData(es);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: "md" }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "es-MX" },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Device,
    CurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
