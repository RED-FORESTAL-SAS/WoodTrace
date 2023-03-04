import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import {
  AuthAccountExistsWithDifferentCredentialFailure,
  AuthCredentialAlreadyInUseFailure,
  AuthEmailAlreadyInUseFailure,
  AuthNetworkRequestFailedFailure,
  AuthWrongPasswordFailure,
  FailureUtils,
} from "src/app/utils/failure.utils";
import { docTypes } from "src/assets/data/document-types";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.page.html",
  styleUrls: ["./sign-up.page.scss"],
})
export class SignUpPage implements OnInit {
  fullName = new FormControl("", [
    Validators.required,
    Validators.minLength(4),
  ]);
  email = new FormControl("", [Validators.required, Validators.email]);
  password = new FormControl("", [
    Validators.required,
    Validators.pattern(
      "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&.+])[A-Za-zd$@$!%*?&].{8,16}"
    ),
  ]);
  docType = new FormControl("", [Validators.required]);
  docNumber = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
  ]);

  docTypes = [];

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {
    /* This is a listener that listens for the enter key to be pressed. If the enter key is pressed, and
    the validator() function returns true, the createUser() function is called. */
    window.addEventListener("keyup", (e) => {
      if (e.key == "Enter" && this.validator()) {
        this.createUser();
      }
    });
  }

  ngOnInit() {
    this.docTypes = docTypes;
  }

  /**
   * Registers a new User in 'wt_users' collection (and Firebase Authentication too) and redirects
   * to email verification route.
   *
   * If email already exists in "usuarios" (previously registered in RedForestal), creates it in
   * 'wt_users' collection. Then redirects to email verification route if required.
   *
   * @dev Check src\app\utils\failure.utils.ts to find the full list of errors that must be handled
   * for Authentication.
   */
  async createUser() {
    this.utilsSvc.presentLoading();

    try {
      let user: User = {
        id: "",
        email: this.email.value,
        password: this.password.value,
        fullName: this.fullName.value,
        docType: this.docType.value,
        docNumber: this.docNumber.value,
        emailVerified: false,
        devices: [this.utilsSvc.getFromLocalStorage("currentDevice")],
      };

      // Register user against Firebase Authentication.
      const userCredential = await this.firebaseSvc
        .createUser(user)
        .catch(async (e) => {
          const failure = FailureUtils.errorToFailure(e);
          FailureUtils.log(failure, "SignUpPage.createUser", user);
          // If user is already registered in RedForestal, try to login with current credentials.
          if (
            failure instanceof AuthCredentialAlreadyInUseFailure ||
            failure instanceof AuthEmailAlreadyInUseFailure
          ) {
            return this.firebaseSvc.Login(user).catch((e) => {
              const loginFailure = FailureUtils.errorToFailure(e);
              if (loginFailure instanceof AuthWrongPasswordFailure) {
                // Password must be the same!
                throw new Error(
                  "Ya estás registrado en Red Forestal pero tu contraseña no es válida. Corrígela para continuar."
                );
              } else {
                throw new Error(
                  "Ocurrión un error desconocido. Por favor intente de nuevo."
                );
              }
            });

            // If account already exists with different credentials.
          } else if (
            failure instanceof
              AuthAccountExistsWithDifferentCredentialFailure ||
            failure instanceof AuthWrongPasswordFailure
          ) {
            throw new Error(
              "Ya estás registrado en Red Forestal, pero tu contraseña no es válida. Por favor corrígela para continuar."
            );
            // If network fails.
          } else if (failure instanceof AuthNetworkRequestFailedFailure) {
            throw new Error(
              "Parece que tienes problemas con la conexión a internet. Por favor intente de nuevo."
            );
          } else {
            throw new Error(
              "Ocurrión un error desconocido. Por favor intente de nuevo."
            );
          }
        });

      // Create user on 'wt_users' collection and local storage.
      delete user.password;
      await this.firebaseSvc
        .addToCollectionById("wt_users", {
          ...user,
          id: userCredential.user.uid,
        })
        // If user creation fails, logout and ask user to retry.
        .catch(async (e) => {
          this.firebaseSvc.logout().catch((e) => {});
          throw new Error(
            "Ocurrión un error durante el proceso de registro. Por favor intente de nuevo."
          );
        });
      this.utilsSvc.saveLocalStorage("user", user);

      // If not verified yet, redirect to email verification, instead redirect to app.
      if (userCredential.user.emailVerified === false) {
        await this.firebaseSvc.sendEmailVerification().catch((e) => {});
        this.utilsSvc.routerLink("/email-verification");
        this.resetForm();
      } else {
        this.utilsSvc.routerLink("/tabs");
        this.resetForm();
      }
    } catch (e) {
      this.utilsSvc.presentToast(e);
    }
    this.utilsSvc.dismissLoading();
  }

  /**
   * The resetForm() function resets form controls
   */
  resetForm() {
    this.email.reset();
    this.password.reset();
    this.fullName.reset();
    this.docType.reset();
    this.docNumber.reset();
  }

  /**
   * If the form field are invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.email.invalid) {
      return false;
    }
    if (this.password.invalid) {
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

    return true;
  }
}
