import { Injectable, OnDestroy } from "@angular/core";
import { Network } from "@capacitor/network";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { NgZone } from "@angular/core";
import { Platform } from "@ionic/angular";

/**
 * Repository to check network connection.
 */
@Injectable({
  providedIn: "root",
})
export class NetworkRepository implements OnDestroy {
  /**
   * Observable that returns a boolean with Network status.
   *
   * @dev This only works for Android and iOS. Not for web.
   */
  public online$: Observable<boolean>;

  /** private BehaviorSubject with network status */
  private online = new BehaviorSubject<boolean>(false);

  /** Subscriptions. */
  private sbs: Subscription[] = [];

  /**
   * @dev NgZone is required for network detection to work with Angular.
   * @see https://github.com/ionic-team/capacitor-plugins/issues/40#issuecomment-680706354
   */
  constructor(private zone: NgZone, private platform: Platform) {
    Network.getStatus().then((status) => this.online.next(status.connected));
    this.online$ = this.online.asObservable();
    Network.addListener("networkStatusChange", (status) => {
      /**
       * @dev NgZone is required for network detection to work with Angular.
       * @see https://github.com/ionic-team/capacitor-plugins/issues/40#issuecomment-680706354
       */

      this.zone.run(() => {
        this.online.next(status.connected);
      });
    });

    // Force network detection on app 'resume' event.
    this.sbs.push(
      this.platform.resume.subscribe(async () => {
        Network.getStatus().then((status) => {
          /**
           * @dev NgZone is required for network detection to work with Angular.
           * @see https://github.com/ionic-team/capacitor-plugins/issues/40#issuecomment-680706354
           */
          this.zone.run(() => {
            return this.online.next(status.connected);
          });
        });
      })
    );
  }

  /**
   * Destroy subscriptions.
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }
}
