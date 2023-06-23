import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Observable, Subscription } from "rxjs";
import { take, tap } from "rxjs/operators";
import { WtUser } from "src/app/models/wt-user";
import { FirebaseService } from "src/app/services/firebase.service";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";

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
export class ProfilePage implements OnInit, OnDestroy {
  photo = new FormControl("");
  loadingPhoto: boolean;
  loading: boolean;

  private sbs: Subscription[] = [];

  /** Observable with active license or null. */
  public user$: Observable<WtUser | null>;

  constructor(
    private firebaseSvc: FirebaseService,
    private userService: UserService,
    private utilsSvc: UtilsService
  ) {
    this.user$ = this.userService.user;
  }

  ngOnInit() {
    this.user$.subscribe((user) => {
      console.log(user);
    });
    this.populateForm();
  }

  ngOnDestroy(): void {
    console.log("Running ngOnDestroy on ProfilePage");
    this.sbs.forEach((s) => s.unsubscribe());
  }

  populateForm() {
    this.sbs.push(
      this.userService.user
        .pipe(
          take(1),
          tap({
            next: (user) => {
              this.photo.setValue(user.photo);
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * It takes a photo, uploads it to Firebase Storage, and then updates the user's profile photo in the
   * database
   */
  async uploadPhoto() {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      promptLabelHeader: "Foto de perfil",
      promptLabelPhoto: "Selecciona una imagen",
      promptLabelPicture: "Toma una foto",
      source: CameraSource.Prompt,
    });

    this.loadingPhoto = true;

    this.photo.setValue(image.dataUrl);
    console.log(this.photo.value);
    this.loadingPhoto = false;
    this.updateUser();
  }

  /**
   * It updates the user information in the database.
   */
  async updateUser() {
    this.sbs.push(
      this.userService.user
        .pipe(
          take(1),
          tap({
            next: async (user) => {
              const patchData = {
                ...user,
                photo: await this.firebaseSvc.uploadPhoto(
                  "wt_users/" + user.id + "/profile",
                  this.photo.value
                ),
              };
              this.userService.patchUser(patchData);

              this.loading = true;
              this.firebaseSvc.UpdateCollection("wt_users", patchData).then(
                (res) => {
                  this.utilsSvc.presentToast(
                    " Foto de perfil actualizada con éxito"
                  );
                  this.loading = false;
                },
                (err) => {
                  console.log(err);

                  this.utilsSvc.presentToast(
                    "No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión"
                  );
                  this.loading = false;
                }
              );
            },
          })
        )
        .subscribe()
    );
  }

  logOut() {
    this.firebaseSvc.logout();
  }
}
