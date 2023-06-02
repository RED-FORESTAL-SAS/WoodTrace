import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { ModalController } from "@ionic/angular";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { PasswordRequiredComponent } from "src/app/shared/components/password-required/password-required.component";
import { docTypes } from "src/assets/data/document-types";
import { generoTypes } from "src/assets/data/genero-types";
import { UpdatePasswordComponent } from "./components/update-password/update-password.component";
import { Timestamp } from "../../../../../../app/types/timestamp.type";
import { WtUser } from "src/app/models/wt-user";
import { UserService } from "src/app/services/user.service";
import { Observable, Subscription } from "rxjs";
import { take, tap } from "rxjs/operators";

@Component({
  selector: "app-owner",
  templateUrl: "./owner.page.html",
  styleUrls: ["./owner.page.scss"],
})
export class OwnerPage implements OnInit, OnDestroy {
  fullName = new FormControl("", [
    Validators.required,
    Validators.minLength(4),
  ]);
  email = new FormControl("", [Validators.required, Validators.email]);
  docType = new FormControl(0, [Validators.required]);
  docNumber = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
  ]);
  photo = new FormControl("");
  movil = new FormControl("", [Validators.required]);
  fNacimiento = new FormControl(null, [Validators.required]);
  genero = new FormControl("", [Validators.required]);

  docTypes = [];
  generoTypes = [];

  user = {} as WtUser;

  loading: boolean;
  loadingPhoto: boolean;

  private sbs: Subscription[] = [];

  /** Observable with active license or null. */
  public user$: Observable<WtUser | null>;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,

    private userService: UserService,
    private modalController: ModalController
  ) {
    this.user$ = this.userService.user;
  }

  ngOnInit() {
    this.docTypes = docTypes;
    this.generoTypes = generoTypes;
    this.populateForm();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
  }

  populateForm() {
    this.sbs.push(
      this.userService.user
        .pipe(
          take(1),
          tap({
            next: (user) => {
              console.log("fechaNacimiento", user.fNacimiento);
              this.email.setValue(user.email);
              this.email.disable();
              this.fullName.setValue(user.fullName);
              this.docType.setValue(user.docType);
              this.docNumber.setValue(user.docNumber);
              this.photo.setValue(user.photo);
              this.movil.setValue(user.movil);
              this.fNacimiento.setValue(user.fNacimiento.toDate());
              this.genero.setValue(user.genero);
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * We're setting the values of the form controls to the values of the user object
   */
  getUser() {
    this.email.setValue(this.user.email);
    this.email.disable();
    this.fullName.setValue(this.user.fullName);
    this.docType.setValue(this.user.docType);
    this.docNumber.setValue(this.user.docNumber);
    this.photo.setValue(this.user.photo);
    this.movil.setValue(this.user.movil);
    // this.fNacimiento.setValue(this.user.fNacimiento );
    this.genero.setValue(this.user.genero);
  }

  /**
   * It updates the user information in the database.
   */
  updateUser() {
    // console.log(this.fNacimiento.value);
    this.user.fullName = this.fullName.value;
    this.user.docType = this.docType.value;
    this.user.docNumber = this.docNumber.value;
    this.user.movil = this.movil.value;
    this.user.fNacimiento = this.fNacimiento.value;
    this.user.genero = this.genero.value;

    this.utilsSvc.saveLocalStorage("user", this.user);

    this.loading = true;
    this.firebaseSvc.UpdateCollection("wt_users", this.user).then(
      (res) => {
        this.utilsSvc.presentToast("Actualizado con éxito");
        this.loading = false;
      },
      (err) => {
        this.utilsSvc.presentToast(
          "No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión"
        );
        this.loading = false;
      }
    );
  }

  /**
   * If the form field are invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.email.invalid) {
      return false;
    }
    if (this.fullName.invalid) {
      return false;
    }
    if (this.docType.invalid) {
      return false;
    }
    if (this.docNumber.invalid) {
      return false;
    }
    if (this.movil.invalid) {
      return false;
    }
    // if (this.fNacimiento.invalid) {
    //   return false;
    // }
    if (this.genero.invalid) {
      return false;
    }

    return true;
  }
}
