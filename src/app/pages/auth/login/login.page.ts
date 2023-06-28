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
import { UserService } from "src/app/services/user.service";
import { Router } from "@angular/router";

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
    private utilsSvc: UtilsService,
    private userService: UserService,
    private router: Router
  ) {
    /**
     * @dev Listens for the enter key to be pressed. If the enter key is pressed, login() function
     * is called
     */
    window.addEventListener("keyup", (e) => {
      if (e.key == "Enter" && this.validator()) {
        this.login();
      }
    });

    this.watchAuthState();
  }

  /**
   * Sign In user with email and password. If it fails, show toast to user.
   */
  login(): void {
    this.loginIn.next(true);
    this.loading = true;

    this.userService
      .emailPasswordLogin(this.email.value, this.password.value)
      .catch((e) => {
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
      this.userService.authState,
      this.loginIn.asObservable(),
    ])
      .pipe(
        // Only hear authState during active/valid user login action.
        filter(([user, loginIn]: [WtUser, boolean]) => {
          return user !== null && loginIn === true;
        }),
        tap({
          next: async ([user, loginIn]: [WtUser, boolean]) => {
            // Si el usuario no está activo, no permitirle entrar.
            if (!user.activo) {
              this.utilsSvc.presentToast(
                "Usuario sin privilegios para ejecutar esta acción."
              );
              await this.userService.signOut();
              this.loading = false;
              this.loginIn.next(false);
              return;
            }

            this.userService.patchUser(user);

            if (!user.emailVerified) {
              this.unwatchAuthState();
              await this.userService.sendEmailVerification();
              await this.router.navigate(["/email-verification"]);
            } else {
              this.unwatchAuthState();
              await this.router.navigate(["/tabs/profile"]);
            }

            this.loading = false;
            this.loginIn.next(false);
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
                await this.userService.signOut();
                this.resetForm();
              } else if (failure instanceof PermissionDeniedFailure) {
                this.utilsSvc.presentToast(
                  "Usuario sin privilegios para ejecutar esta acción."
                );
                await this.userService.signOut();
                this.resetForm();
              } else {
                this.utilsSvc.presentToast(
                  "Ocurrió un Error desconocido. Por favor intente de nuevo."
                );
                await this.userService.signOut();
                this.resetForm();
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
