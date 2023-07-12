import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { WtUser } from "src/app/models/wt-user";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import {
  AuthAccountExistsWithDifferentCredentialFailure,
  AuthCredentialAlreadyInUseFailure,
  AuthEmailAlreadyInUseFailure,
  AuthNetworkRequestFailedFailure,
  AuthWrongPasswordFailure,
  FailureUtils,
  NoNetworkFailure,
  NotFoundFailure,
  PermissionDeniedFailure,
} from "src/app/utils/failure.utils";
import { docTypes } from "src/assets/data/document-types";
import { generoTypes } from "src/assets/data/genero-types";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.page.html",
  styleUrls: ["./sign-up.page.scss"],
})
export class SignUpPage implements OnInit, OnDestroy {
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
  docType = new FormControl(0, [Validators.required]);
  docNumber = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
  ]);
  genero = new FormControl("", [Validators.required]);
  fNacimiento = new FormControl(null, [Validators.required]);
  movil = new FormControl("", [Validators.required, Validators.minLength(10)]);
  photo = new FormControl("", [Validators.required]);

  docTypes = [];
  generoTypes = [];

  /** Flag to indicate than registration process finished. */
  private registered = new BehaviorSubject<boolean>(false);

  /** Suscriptions handler. */
  private sbs: Subscription[] = [];

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

  ngOnInit(): void {
    this.docTypes = docTypes;
    this.generoTypes = generoTypes;

    // Watch Firebase AuthState. When registration finishes, redirect user to 'email verification'
    // (if required) or to an internal app screen.
    this.sbs.push(
      this.registered
        .asObservable()
        .pipe(
          filter((registered) => registered === true),
          switchMap(() => this.firebaseSvc.authStateLegacy),
          filter((user) => user !== null),
          tap({
            next: async (user) => {
              // Save registered user to local Storage.
              this.utilsSvc.saveLocalStorage("user", user);

              // If not verified yet, redirect to email verification, instead redirect to app.
              if (user.emailVerified === false) {
                await this.firebaseSvc
                  .sendEmailVerificationLegacy()
                  .catch((e) => {});
                this.firebaseSvc.signOut();
                this.utilsSvc.routerLink("/email-verification");
                this.resetForm();
              } else {
                this.utilsSvc.routerLink("/tabs/profile");
                this.resetForm();
              }
            },
            error: (e) => {
              const failure = FailureUtils.errorToFailure(e);
              FailureUtils.log(failure, "SignUp.ngOnInit");
              if (failure instanceof NoNetworkFailure) {
                this.utilsSvc.presentToast(
                  "Parece que tienes problemas con la conexión a internet. Por favor intente de nuevo."
                );
              } else if (failure instanceof NotFoundFailure) {
                this.utilsSvc.presentToast(
                  "No encontramos el usuario en la app. Por favor regístrate para continuar."
                );
                this.firebaseSvc.signOut();
              } else if (failure instanceof PermissionDeniedFailure) {
                this.utilsSvc.presentToast(
                  "Usuario sin privilegios para ejecutar esta acción."
                );
                this.firebaseSvc.signOut();
              } else {
                this.utilsSvc.presentToast(
                  "Ocurrió un Error desconocido. Por favor intente de nuevo."
                );
              }
              this.registered.next(false);
            },
          })
        )
        .subscribe()
    );
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
      let user: WtUser = {
        id: "",
        email: this.email.value,
        password: this.password.value,
        fullName: this.fullName.value,
        docType: this.docType.value,
        docNumber: this.docNumber.value,
        emailVerified: false,
        genero: this.genero.value,
        fNacimiento: this.fNacimiento.value,
        movil: this.movil.value,
        photo: this.photo.value,
        devices: [this.utilsSvc.getFromLocalStorage("currentDevice")],
        activo: true,
        firstReport: true,
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

      // Validate if user already exists to prevent registration form to serve as an 'update' form.
      const userExists = await this.firebaseSvc
        .getDataById("wt_users", userCredential.user.uid)
        .valueChanges()
        .pipe(take(1))
        .toPromise()
        .catch((e) => null);

      if (!userExists) {
        // Create user on 'wt_users' collection and local storage.
        console.log(user, userCredential.user.uid);
        delete user.password;
        await this.firebaseSvc
          .addToCollectionById("wt_users", {
            ...user,
            id: userCredential.user.uid,
          })
          // If user creation fails, logout and ask user to retry.
          .catch(async (e) => {
            this.firebaseSvc.signOut().catch((e) => {});
            throw new Error(
              "Ocurrión un error durante el proceso de registro. Por favor intente de nuevo."
            );
          });
      }

      // Mark flag 'registered' to trigger AuthState subscription.
      this.registered.next(true);
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
    this.genero.reset();
    this.fNacimiento.reset();
    this.movil.reset();
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
    if (this.genero.invalid) {
      return false;
    }
    if (this.fNacimiento.invalid) {
      return false;
    }
    if (this.movil.invalid) {
      return false;
    }
    return true;
  }

  /**
   * Unsubscribe.
   */
  ngOnDestroy(): void {
    this.registered.next(false);
    this.registered.complete();
    this.sbs.forEach((s) => s.unsubscribe());
  }
}
