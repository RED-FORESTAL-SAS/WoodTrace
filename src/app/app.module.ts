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

import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { provideAuth, getAuth, connectAuthEmulator } from "@angular/fire/auth";
import {
  provideFirestore,
  getFirestore,
  connectFirestoreEmulator,
} from "@angular/fire/firestore";
import {
  connectStorageEmulator,
  getStorage,
  provideStorage,
} from "@angular/fire/storage";
import { environment } from "src/environments/environment";

// ======= Plugins =======
import { Device } from "@awesome-cordova-plugins/device/ngx";
import { CurrencyPipe, registerLocaleData } from "@angular/common";

registerLocaleData(es);

/**
 * @todo @diana Esta clase contiene dependencias a módulos de angular fire en modo compat. Deberían
 * eliminarse, una vez se migre lo implementado en el archivo firebase.service.ts.
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: "md" }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, "http://localhost:9099", {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, "localhost", 8080);
      }
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulators) {
        connectStorageEmulator(storage, "localhost", 9199);
      }
      return storage;
    }),
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
