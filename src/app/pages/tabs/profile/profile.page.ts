import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription, combineLatest } from "rxjs";
import { isEqual } from "lodash";
import {
  distinctUntilChanged,
  filter,
  map,
  skip,
  skipWhile,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { WtUser } from "src/app/models/wt-user";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";
import { CameraService } from "src/app/services/camera.service";
import { ReportFailure, ReportService } from "src/app/services/report.service";
import { WtReport } from "src/app/models/wt-report";
import { NoNetworkFailure } from "src/app/utils/failure.utils";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnDestroy, OnInit {
  photo = new FormControl("");
  loadingPhoto: boolean;
  loading: boolean;

  private sbs: Subscription[] = [];

  /** Observable with active User. Null if no User is active. */
  public user$: Observable<WtUser | null>;

  /** Observable with reports pending for sync. */
  public reports$: Observable<WtReport[]>;

  /** Observable that checks if device is online/offline. */
  public online$: Observable<boolean>;

  /** Show/hide sync button. */
  public showSyncButton$: Observable<boolean>;

  /** BehaviorSubject to deal with event "sync reports" */
  public syncReportsEvent = new BehaviorSubject<number>(null);

  /** Evento que se dispara cuando se hace click en el botón de filtrar. */
  public uploadPhotoClickEvent = new BehaviorSubject<number | null>(null);

  /** If no internet connection message was already shown. */
  public noInternetConnectionMessageShown = false;

  constructor(
    private userService: UserService,
    private cameraService: CameraService,
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {
    // Watch events and User.
    this.watchUploadPhotoClicks();
    this.user$ = this.userService.user.pipe(distinctUntilChanged(isEqual));
    this.reports$ = this.reportService.reports.pipe(
      map((reports) => reports.filter((report) => !report.synced))
    );
    this.online$ = this.userService.online;

    this.showSyncButton$ = combineLatest([this.reports$, this.online$]).pipe(
      map(([reports, online]) => reports.length > 0 && online)
    );
  }

  /**
   * Destroy subscriptions. Won't be called when user leave the page.
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  /**
   * Try to sync every time it enters the screen. If there is nothing to sync, it will do nothing.
   */
  async ionViewDidEnter() {
    const online = await this.online$.pipe(take(1)).toPromise();
    const reports = await this.reports$.pipe(take(1)).toPromise();

    if (reports.length > 0 && online) {
      if (this.syncReportsEvent.value === null) {
        this.syncReportsEvent.next(Date.now());
      }
    }
  }

  /**
   * Initialize component. Will be called only the first time the screen is open.
   */
  ngOnInit(): void {
    this.syncReportsHandler();
  }

  ionViewWillLeave(): void {
    console.log("ProfilePage::ionViewWillLeave");
    // this.sbs.forEach((s) => s.unsubscribe());
  }

  /**
   * UplodPhoto click event.
   */
  public onUploadPhotoClick(): void {
    this.uploadPhotoClickEvent.next(Date.now());
  }

  /**
   * Triggers the "sync reports" event.
   */
  public syncReports(): void {
    this.syncReportsEvent.next(Date.now());
  }

  /**
   * Handles the event "sync reports".
   * Suyncs one report at a time. When one is done, triggers the event again.
   */
  private syncReportsHandler(): void {
    this.sbs.push(
      this.syncReportsEvent
        .asObservable()
        .pipe(
          skip(1),
          filter((v) => v !== null),
          switchMap((_) => this.reports$.pipe(take(1))),
          withLatestFrom(this.online$),
          tap({
            next: async ([reports, online]) => {
              // Check if online before start.
              if (!online) {
                await this.utilsSvc.dismissLoading().catch(() => {});
                if (!this.noInternetConnectionMessageShown) {
                  this.utilsSvc.presentToast("No tienes conexión a internet.");
                  this.noInternetConnectionMessageShown = true;
                }
                this.syncReportsEvent.next(null);
                return;
              } else {
                this.noInternetConnectionMessageShown = false; // Reset flag.
              }

              // Check if there are reports to sync.
              if (reports.length === 0) {
                await this.utilsSvc.dismissLoading().catch(() => {});
                this.syncReportsEvent.next(null);
                return;
              }

              const reportsCount = reports.length;
              this.utilsSvc.dismissLoading().catch(() => {});
              await this.utilsSvc.presentLoading(
                `Sincronizando ${reportsCount}...`
              );

              const report = reports[0];
              await this.reportService
                .syncReport(report)
                .then(async () => {
                  // Trigger next sync event.
                  if (reports.length > 1) {
                    this.syncReportsEvent.next(Date.now());
                  } else {
                    await this.utilsSvc.dismissLoading().catch(() => {});
                    this.syncReportsEvent.next(null);
                  }
                })
                .catch(async (e) => {
                  // Show any network error.
                  if (e instanceof NoNetworkFailure) {
                    this.utilsSvc.presentToast(
                      "No tienes conexión a internet."
                    );
                  }

                  // Show any ReportFailure directly.
                  else if (e instanceof ReportFailure) {
                    this.utilsSvc.presentToast(e.message);

                    // Any other error will be shown like this.
                  } else {
                    this.utilsSvc.presentToast("Error de sincronización.");
                  }

                  await this.utilsSvc.dismissLoading().catch(() => {});
                  this.syncReportsEvent.next(null);
                });
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * Build subscription for the uploadPhotoClickEvent.
   */
  private watchUploadPhotoClicks(): void {
    this.uploadPhotoClickEvent
      .asObservable()
      .pipe(
        skip(1),
        switchMap((_) => this.userService.online),
        tap({
          next: async (online) => {
            if (!online) {
              this.utilsSvc.presentToast("No tienes conexión a internet.");
              return;
            }

            const photo = await this.cameraService.pickOrTakePhoto({
              promptLabelHeader: "Foto de perfil",
            });
            if (!photo) return;

            this.loadingPhoto = true;
            await this.userService.updateUserPhoto(photo).catch((e) => {
              /**
               * @todo @mario Refinar los mensajes de error.
               */
              this.utilsSvc.presentToast(
                "Ocurrió un error al subir el archivo. Por favor intente de nuevo."
              );
            });
            this.loadingPhoto = false;
          },
        })
      )
      .subscribe();
  }

  public async signOut(): Promise<void> {
    await this.userService.signOut();
    window.location.replace("/login");
  }
}
