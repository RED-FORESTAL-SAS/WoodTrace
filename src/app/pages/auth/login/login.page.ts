import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { UtilsService } from "src/app/services/utils.service";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { tap } from "rxjs/operators";
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
export class LoginPage {
  email = new FormControl("", [Validators.required, Validators.email]);
  password = new FormControl("", [Validators.required]);

  /** Flag to indicate that user is currently login In. */
  private loginIn = new BehaviorSubject<boolean>(true);
  public loginIn$: Observable<boolean>;

  /** Subscription to AuthState */
  private authStateSbs: Subscription | null = null;

  constructor(
    private utilsSvc: UtilsService,
    private userService: UserService,
    private router: Router
  ) {
    this.loginIn$ = this.loginIn.asObservable();

    // Bind enter key to 'login' method.
    window.addEventListener("keyup", (e) => {
      if (e.key == "Enter" && this.validator()) {
        this.login();
      }
    });
  }

  /**
   * Subscribe to AuthState.
   *
   * @dev Ionic loads components one time and never distroys theme.
   * Subscription to AuthState should be here, since it must be initialized every time the app
   * enters the login page.
   */
  ionViewWillEnter(): void {
    this.loginIn.next(true);
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
   * Sign In user with email and password. If it fails, show toast to user.
   */
  login(): void {
    this.loginIn.next(true);
    this.userService
      .emailPasswordLogin(this.email.value, this.password.value)
      .catch((e) => {
        const failure = FailureUtils.errorToFailure(e);
        FailureUtils.log(failure, "LoginPage.ngOnInit");

        this.loginIn.next(false);

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
    this.authStateSbs = this.userService.authState
      .pipe(
        tap({
          next: async (user: WtUser) => {
            // If user is null, do nothing.
            if (user === null) {
              if (this.loginIn.value) this.loginIn.next(false);
              return;
            }

            // If user is not active, kick him out.
            if (!user.activo) {
              this.utilsSvc.presentToast(
                "Usuario sin privilegios para ejecutar esta acción."
              );
              await this.userService.signOut();
              if (this.loginIn.value) this.loginIn.next(false);
              return;
            }

            // If user has verified his email, let him in.
            if (!!user.emailVerified) {
              await this.router.navigate(["/tabs/profile"]);
              if (this.loginIn.value) this.loginIn.next(false);
            }

            /**
             * @todo @mario User should be redirected to email verification page. He should not be
             * trying to login again, since there is already a session open.
             *
             * If he showld be allowed, put code inside this if statement: if (loginIn) {...}
             */

            // If user is performing a login and has not verified his email, send him a verification
            // email and redirect to email-verification page. If he returns to login he wont be
            // redirected again.
            await this.userService.sendEmailVerification();
            await this.router.navigate(["/email-verification"]);
            if (this.loginIn.value) this.loginIn.next(false);
          },
          error: async (e) => {
            const failure = FailureUtils.errorToFailure(e);
            FailureUtils.log(failure, "LoginPage.ngOnInit");
            if (failure instanceof NoNetworkFailure) {
              this.utilsSvc.presentToast(
                "Parece que tienes problemas con la conexión a internet. Por favor intenta de nuevo."
              );

              // If user exists in Firebase Auth, but not in user collection (already registered
              // in Red Forestal).
            } else if (failure instanceof NotFoundFailure) {
              this.utilsSvc.presentToast("Por favor regístrate para acceder.");
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

            this.loginIn.next(false);
          },
        })
      )
      .subscribe();
  }

  /**
   * Stops watching Firebase AuthState.
   */
  unwatchAuthState(): void {
    if (this.authStateSbs !== null) {
      this.authStateSbs.unsubscribe();
      this.authStateSbs = null;
    }
    this.loginIn.next(false);
    this.loginIn.complete();
  }

  /**
   * Resets the email and password form controls
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
    if (this.email.invalid || this.password.invalid) {
      return false;
    }

    return true;
  }
}
