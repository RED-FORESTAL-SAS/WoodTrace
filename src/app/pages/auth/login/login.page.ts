import { Component, OnDestroy } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { BehaviorSubject, combineLatest, Subscription } from "rxjs";
import { filter, tap } from "rxjs/operators";
import {
  AuthInvalidEmailFailure,
  AuthNetworkRequestFailedFailure,
  AuthTimeoutFailure,
  AuthTooManyRequestsFailure,
  AuthUserDisabledFailure,
  AuthUserNotFoundFailure,
  AuthWrongPasswordFailure,
  FailureUtils,
  NoNetworkFailure,
  NotFoundFailure,
  PermissionDeniedFailure,
} from "src/app/utils/failure.utils";
import { WtUser } from "src/app/models/wt-user";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnDestroy {
  email = new FormControl("", [Validators.required, Validators.email]);
  password = new FormControl("", [Validators.required]);

  loading: boolean;

  /** Flag to indicate that user is currently login In. */
  private loginIn = new BehaviorSubject<boolean>(false);

  /** Subscription to AuthState */
  private authStateSbs: Subscription | null = null;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {
    /* This is a listener that listens for the enter key to be pressed. If the enter key is pressed, and
    the validator() function returns true, the login() function is called. */
    window.addEventListener("keyup", (e) => {
      if (e.key == "Enter" && this.validator()) {
        this.login();
      }
    });
  }

  /**
   * Sign In user with email and password. If it fails, show toast to user.
   */
  login(): void {
    // Whatch Firesbase Auth State from first login click.
    if (!this.authStateSbs) {
      this.watchAuthState();
    }

    this.loginIn.next(true);
    this.loading = true;

    /**
     * @todo @Mario manejar el estado activo e inactivo entonces para poder loguearse.
     * De hecho hay que revisar esta manera de loguearse, porque no es la mejor.
     */

    let user: WtUser = {
      id: "",
      email: this.email.value,
      password: this.password.value,
      fullName: "",
      docType: 0,
      docNumber: "",
      emailVerified: null,
      genero: "",
      fNacimiento: null,
      movil: "",
      devices: [],
      photo: "",
      activo: true,
      firstReport: false,
    };

    this.firebaseSvc.Login(user).catch((e) => {
      const failure = FailureUtils.errorToFailure(e);
      FailureUtils.log(failure, "LoginPage.ngOnInit");

      this.loginIn.next(false);
      this.loading = false;

      if (
        failure instanceof AuthNetworkRequestFailedFailure ||
        failure instanceof AuthTimeoutFailure
      ) {
        this.utilsSvc.presentToast(
          "Parece que tienes problemas con la conexión a internet. Por favor intente de nuevo."
        );
      } else if (
        failure instanceof AuthWrongPasswordFailure ||
        failure instanceof AuthInvalidEmailFailure
      ) {
        this.utilsSvc.presentToast(
          "Credenciales inválidas. Por favor intenta de nuevo."
        );
      } else if (failure instanceof AuthUserNotFoundFailure) {
        this.utilsSvc.presentToast(
          "Este usuario no existe. Regístrate para acceder."
        );
      } else if (
        failure instanceof AuthTooManyRequestsFailure ||
        failure instanceof AuthUserDisabledFailure
      ) {
        this.utilsSvc.presentToast(
          "Parece que hay problemas con tu usuario. Por favor contacta al administrador."
        );
      } else {
        this.utilsSvc.presentToast(
          "Ocurrió un Error desconocido. Por favor intente de nuevo."
        );
      }
    });
  }

  /**
   * Watches Firebase AuthState. When it turns authenticated, redirects user to 'email verification'
   * (if required) or to an internal app screen.
   */
  watchAuthState(): void {
    this.authStateSbs = combineLatest([
      this.firebaseSvc.authState,
      this.loginIn.asObservable(),
    ])
      // this.firebaseSvc.authState
      .pipe(
        // Only hear authState during active/valid user login action.
        filter(([user, loginIn]: [User, boolean]) => {
          // filter((user) => {
          return user !== null && loginIn === true;
        }),
        tap({
          next: ([user, loginIn]: [User, boolean]) => {
            // next: (user) => {
            this.utilsSvc.saveLocalStorage("user", user);
            this.loading = false;
            this.loginIn.next(false);

            if (!user.emailVerified) {
              this.unwatchAuthState();
              this.utilsSvc.routerLink("/email-verification");
              this.firebaseSvc.sendEmailVerification();
            } else {
              this.unwatchAuthState();
              this.utilsSvc.routerLink("/tabs/profile");
              this.resetForm();
            }

            /**
             * @todo @mario Modificar el método authState, para que devuelva un WtUser y no un User.
             * @todo @diana Agregar condicional para verificar el campo "activo" del usuario.
             */
          },
          error: async (e) => {
            if (this.loginIn.value) {
              const failure = FailureUtils.errorToFailure(e);
              FailureUtils.log(failure, "LoginPage.ngOnInit");
              if (failure instanceof NoNetworkFailure) {
                this.utilsSvc.presentToast(
                  "Parece que tienes problemas con la conexión a internet. Por favor intente de nuevo."
                );

                // If user exists in Firebase Auth, but not in user collection (already registered
                // in Red Forestal).
              } else if (failure instanceof NotFoundFailure) {
                this.utilsSvc.presentToast(
                  "Por favor regístrate para acceder."
                );
                await this.firebaseSvc.signOut();
                this.resetForm();
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

              this.loading = false;
              this.loginIn.next(false);
            }
          },
        })
      )
      .subscribe();
  }

  /**
   * Stops watching Firebase AuthState.
   *
   * This is required, since this component never gets destroy when SingUpPage is open. This
   * replaces ngOnInit and ngOnDestroy component behaviour.
   */
  unwatchAuthState() {
    if (this.authStateSbs !== null) {
      this.authStateSbs.unsubscribe();
      this.authStateSbs = null;
    }
    this.loginIn.next(false);
  }

  /**
   * The resetForm() function resets the email and password form controls
   */
  resetForm(): void {
    this.email.reset();
    this.password.reset();
  }

  /**
   * Returns a boolean that indicates if email and password are valid.
   *
   * @returns boolean.
   */
  validator(): boolean {
    if (this.email.invalid) {
      return false;
    }
    if (this.password.invalid) {
      return false;
    }

    return true;
  }

  /**
   * Unsubscribe.
   */
  ngOnDestroy(): void {
    this.unwatchAuthState();
  }
}
