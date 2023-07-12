import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { docTypes } from "src/assets/data/document-types";
import { generoTypes } from "src/assets/data/genero-types";
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

  loading: boolean;
  loadingPhoto: boolean;

  private sbs: Subscription[] = [];

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
    this.docTypes = docTypes;
    this.generoTypes = generoTypes;
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
   * It updates the user information in the database.
   */
  updateUser() {
    this.sbs.push(
      this.userService.user
        .pipe(
          take(1),
          tap({
            next: async (user) => {
              const patchData = {
                ...user,
                fullName: this.fullName.value,
                docType: this.docType.value,
                docNumber: this.docNumber.value,
                movil: this.movil.value,
                fNacimiento: this.fNacimiento.value,
                genero: this.genero.value,
              };
              this.userService.patchUser(patchData);

              this.loading = true;
              this.firebaseSvc.UpdateCollection("wt_users", patchData).then(
                (res) => {
                  this.utilsSvc.presentToast(" Usuario actualizada con éxito");
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
