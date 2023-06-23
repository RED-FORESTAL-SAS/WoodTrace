import { Component, OnDestroy } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { isEqual } from "lodash";
import { distinctUntilChanged, skip, switchMap, tap } from "rxjs/operators";
import { WtUser } from "src/app/models/wt-user";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";
import { CameraService } from "src/app/services/camera.service";
import { Router } from "@angular/router";
import { UserStore } from "src/app/state/user.store";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
  /**
   * @todo @mario Esto provee una instancia única del servicio, que forza a que se cree y se
   * destruya el servicio y a que se inicialicen nuevamente los observables. Esto no debería de ser
   * necesario. Lo que debe hacerse es un refactor en el metodo UserService.retrieveAuthenticatedUser()
   * para que se recalcule cuando se hace nuevamente la autenticación.
   */
})
export class ProfilePage implements OnDestroy {
  photo = new FormControl("");
  loadingPhoto: boolean;
  loading: boolean;

  private sbs: Subscription[] = [];

  /** Observable with active User. Null if no User is active. */
  public user$: Observable<WtUser | null>;

  /** Evento que se dispara cuando se hace click en el botón de filtrar. */
  public uploadPhotoClickEvent = new BehaviorSubject<number | null>(null);

  constructor(
    private userService: UserService,
    private cameraService: CameraService,
    private router: Router,
    private utilsSvc: UtilsService
  ) {
    // Watch events and User.
    this.watchUploadPhotoClicks();
    this.user$ = this.userService.user.pipe(distinctUntilChanged(isEqual));

    // Redirect to login if user signs out.
    this.sbs.push(
      this.user$.pipe(skip(1)).subscribe((user) => {
        if (user === null) {
          console.log("Logout. Redirect to login");
          this.router.navigate(["login"]);
        }
      })
    );
  }

  /**
   * Destroy subscriptions.
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  /**
   * UplodPhoto click event.
   */
  public onUploadPhotoClick(): void {
    this.uploadPhotoClickEvent.next(Date.now());
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
    // this.router.navigate(["login"]);
  }
}
