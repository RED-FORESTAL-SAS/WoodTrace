import { Injectable } from "@angular/core";
import { Network } from "@capacitor/network";
import { BehaviorSubject, Observable } from "rxjs";
import { skip } from "rxjs/operators";

/**
 * Repository to check network connection.
 */
@Injectable({
  providedIn: "root",
})
export class NetworkRepository {
  private online = new BehaviorSubject<boolean>(false);
  public online$: Observable<boolean>;

  constructor() {
    this.online$ = this.online.asObservable();

    /**
     * @todo @mario Implementar detección de la conexión. Actualmente no funciona con @capacitor/network.
     * así que se comenta el código y se implementa un mock.
     */
    this.online.next(true);

    // Network.addListener("networkStatusChange", (status) => {
    //   console.log("Network status changed", status);
    //   this.online.next(status.connected);
    // });
  }
}
