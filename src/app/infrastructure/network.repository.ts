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

  /**
   * Observable that returns a boolean with Network status.
   *
   * @dev This only works for Android and iOS. Not for web.
   */
  public online$: Observable<boolean>;

  constructor() {
    this.online$ = this.online.asObservable();
    Network.addListener("networkStatusChange", (status) => {
      this.online.next(status.connected);
    });
  }
}
