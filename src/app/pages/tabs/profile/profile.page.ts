import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { PdfService } from "src/app/services/pdf.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  photo = new FormControl("");
  loadingPhoto: boolean;

  user = {} as User;

  loading: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getUser();
  }

  currentUser(): User {
    console.log();
    return this.utilsSvc.getCurrentUser();
  }

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

  /**
   * It calculates the difference between two dates and returns the number of days
   */
  // async getLicenseRemainingDays() {
  //   let currentUser: User = this.currentUser();

  //   if (currentUser.license && currentUser.license.dateInit) {
  //     let currentDate = this.utilsSvc.getCurrentDate();
  //     currentUser.license.remainingDays = this.utilsSvc.getDiffDays(
  //       currentDate,
  //       currentUser.license.dateEnd
  //     );
  //     this.utilsSvc.saveLocalStorage("user", currentUser);

  //     if (currentUser.license.remainingDays <= 0) {
  //       await this.firebaseSvc.deleteFromCollection(
  //         "licenses",
  //         currentUser.license.id
  //       );

  //       currentUser.license = null;
  //       this.utilsSvc.saveLocalStorage("user", currentUser);
  //     }
  //   }
  // }

  // async passwordRequired() {
  //   let passwordValid = await this.utilsSvc.passwordRequired();
  //   if (passwordValid) {
  //     this.utilsSvc.routerLink('/tabs/profile/admin-account')
  //   }
  // }

  logOut() {
    this.firebaseSvc.logout();
  }
}
