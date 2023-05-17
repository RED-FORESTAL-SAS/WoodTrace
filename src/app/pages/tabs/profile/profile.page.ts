import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Observable, Subscription } from "rxjs";
import { take, tap } from "rxjs/operators";
import { User } from "src/app/models/user.model";
import { WtUser } from "src/app/models/wt-user";
import { FirebaseService } from "src/app/services/firebase.service";
import { PdfService } from "src/app/services/pdf.service";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit, OnDestroy {
  photo = new FormControl("");
  loadingPhoto: boolean;

  private sbs: Subscription[] = [];

  user = {} as User;

  loading: boolean;

  /** Observable with active license or null. */
  public user$: Observable<WtUser | null>;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private userService: UserService
  ) {
    this.user$ = this.userService.user;
  }

  ngOnInit() {
    this.populateForm();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  populateForm() {
    this.sbs.push(
      this.userService.user
        .pipe(
          take(1),
          tap({
            next: (user) => {
              console.log(user.email);
              this.photo.setValue(user.photo);
            },
          })
        )
        .subscribe()
    );
  }

  // ionViewWillEnter() {
  //   this.user = this.utilsSvc.getCurrentUser();
  //   this.getUser();
  // }

  // currentUser(): User {
  //   console.log();
  //   return this.utilsSvc.getCurrentUser();
  // }

  /**
   * This function sets the values of the form fields to the values of the user object
   */
  getUser() {
    this.photo.setValue(this.user.photo);
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
    this.loadingPhoto = false;
    this.updateUser();
  }

  /**
   * It updates the user information in the database.
   */
  async updateUser() {
    if (this.user.photo !== this.photo.value) {
      this.user.photo = await this.firebaseSvc.uploadPhoto(
        "wt_users/" + this.user.id + "/profile",
        this.photo.value
      );
      console.log(this.user.photo);
    }

    this.loading = true;
    this.firebaseSvc.UpdateCollection("wt_users", this.user).then(
      (res) => {
        this.utilsSvc.presentToast("Actualizado con éxito");
        this.utilsSvc.routerLink("/tabs/profile/admin-account");
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
  }

  logOut() {
    this.firebaseSvc.logout();
  }

  eliminarCuenta() {
    this.utilsSvc.presentAlertConfirm({
      header: "Eliminar la cuenta",
      message: "¿Está seguro de que desea eliminar la cuenta?",
      buttons: [
        {
          text: "Cancelar",
          handler: () => {},
        },
        {
          text: "Continuar",
          handler: () => {
            /** @todo falta definir las políticas de eliminación de cuentas y la funcionalidad.  */
            this.utilsSvc.presentToast(
              ":P Falta desarrollar esta funcionalidad. "
            );
          },
        },
      ],
    });
  }
}
