import { LOCALE_ID, NgModule } from "@angular/core";
import es from "@angular/common/locales/es";

import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";

/**
 * @todo @mario Este import no debería necesitarse, pero aun hay funcionalidades que usan
 * imports 'compat' de firestore. Por eso es que requieren el provider. ¡BORRAR!
 */
import { FIREBASE_OPTIONS } from "@angular/fire/compat";

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
import { IonicStorageModule } from "@ionic/storage-angular";
import { IonicLocalStorageRepository } from "./infrastructure/ionic-local-storage.repository";

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
    IonicStorageModule.forRoot(),
  ],
  providers: [
    /**
     * @todo @mario Este provider no debería necesitarse, pero aun hay funcionalidades que usan
     * imports 'compat' de firestore. Por eso es que requieren el provider. ¡BORRAR!
     */
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    { provide: LOCALE_ID, useValue: "es-MX" },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Device,
    CurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
