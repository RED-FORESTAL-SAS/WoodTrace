import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";
import { WtUser } from "src/app/models/wt-user";
import { FirebaseService } from "src/app/services/firebase.service";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";
import { Timestamp } from "src/app/types/timestamp.type";
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
export class SignUpPage {
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

  /** Subscription to AuthState */
  private authStateSbs: Subscription | null = null;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private userService: UserService,
    private router: Router
  ) {
    // Bind enter key to 'createUser' method.
    window.addEventListener("keyup", (e) => {
      if (e.key == "Enter" && this.validator()) {
        this.createUser();
      }
    });

    // Init form fields.
    this.docTypes = docTypes;
    this.generoTypes = generoTypes;
  }

  /**
   * Subscribe to AuthState.
   *
   * @dev Ionic loads components one time and never distroys theme.
   * Subscription to AuthState should be here, since it must be initialized every time the app
   * enters the login page.
   */
  ionViewWillEnter(): void {
    this.watchAuthState();
  }

  /**
   * Unsubscribe from AuthState.
   *
   * @dev Ionic loads components one time and never distroys theme.
   * Unsubscribe from AuthState should be here, since it must be destroyed every time user leaves
   * the login page. Otherwise, it will interfere with other pages logic.
   */
  ionViewWillLeave(): void {
    this.unwatchAuthState();
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

    const fNacimientoString = this.fNacimiento.value.toString();
    const fNacimientoArray = fNacimientoString.split("-");
    const fNacimiento = new Date(
      fNacimientoArray[0],
      fNacimientoArray[1] - 1,
      fNacimientoArray[2]
    );

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
        fNacimiento: Timestamp.fromDate(fNacimiento),
        movil: this.movil.value,
        photo: this.photo.value,
        devices: [this.utilsSvc.getFromLocalStorage("currentDevice")],
        activo: true,
        firstReport: true,
      };

      // Register user against Firebase Authentication.
      const userCredential = await this.firebaseSvc
        .createUserWithEmailAndPassword(user.email, user.password)
        .catch(async (e) => {
          const failure = FailureUtils.errorToFailure(e);
          FailureUtils.log(failure, "SignUpPage.createUser", user);
          // If user is already registered in RedForestal, try to login with current credentials.
          if (
            failure instanceof AuthCredentialAlreadyInUseFailure ||
            failure instanceof AuthEmailAlreadyInUseFailure
          ) {
            return this.userService
              .emailPasswordLogin(user.email, user.password)
              .catch((e) => {
                const loginFailure = FailureUtils.errorToFailure(e);
                if (loginFailure instanceof AuthWrongPasswordFailure) {
                  // Password must be the same!
                  throw new Error(
                    "Ya estabas registrado en Red Forestal. Por favor inicia sesión para continuar."
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

      // Create user in database if it doesn´t exist.
      await this.userService
        .createUser({
          ...user,
          id: userCredential.user.uid,
        })
        .catch(async (e) => {
          this.userService.signOut().catch((e) => {});
          throw new Error(
            "Ocurrión un error durante el proceso de registro. Por favor intente de nuevo."
          );
        });

      // Mark flag 'registered' to trigger AuthState subscription.
      this.registered.next(true);
    } catch (e) {
      this.utilsSvc.presentToast(e);
    }
    this.utilsSvc.dismissLoading();
  }

  /**
   * Watches if user is registered to get AuthState. Then redirects user to 'email verification' or
   * 'profile' screen, depending on email verification status.
   */
  watchAuthState(): void {
    this.authStateSbs = this.registered
      .asObservable()
      .pipe(
        filter((registered) => registered === true),
        switchMap(() => this.userService.authState),
        filter((user) => user !== null),
        tap({
          next: async (user) => {
            // If not verified yet, redirect to email verification, instead redirect to app.
            if (user.emailVerified === false) {
              await this.userService.sendEmailVerification().catch((e) => {});
              this.router.navigate(["/email-verification"]);
              this.resetForm();
            } else {
              this.router.navigate(["/tabs/profile"]);
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
              this.userService.signOut();
            } else if (failure instanceof PermissionDeniedFailure) {
              this.utilsSvc.presentToast(
                "Usuario sin privilegios para ejecutar esta acción."
              );
              this.userService.signOut();
            } else {
              this.utilsSvc.presentToast(
                "Ocurrió un Error desconocido. Por favor intente de nuevo."
              );
            }
            this.registered.next(false);
          },
        })
      )
      .subscribe();
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
  unwatchAuthState(): void {
    if (this.authStateSbs !== null) {
      this.authStateSbs.unsubscribe();
      this.authStateSbs = null;
    }
    this.registered.next(false);
    this.registered.complete();
  }
}
