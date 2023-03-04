import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { BehaviorSubject, Subscription } from "rxjs";
import { filter, tap } from "rxjs/operators";
import {
  FailureUtils,
  NoNetworkFailure,
  NotFoundFailure,
  PermissionDeniedFailure,
} from "src/app/utils/failure.utils";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit, OnDestroy {
  /**
   * @todo: Borrar valores para testing.
   */
  email = new FormControl("mario@webintegral.com.co", [
    Validators.required,
    Validators.email,
  ]);
  password = new FormControl("Asdf1234+", [Validators.required]);

  loading: boolean;

  /** Flag to indicate that user is currently login In. */
  private loginIn = new BehaviorSubject<boolean>(false);

  /** Suscriptions handler. */
  private sbs: Subscription[] = [];

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
    this.loginIn.next(true);
    this.loading = true;

    let user: User = {
      id: "",
      email: this.email.value,
      password: this.password.value,
      emailVerified: null,
    };

    this.firebaseSvc.Login(user).catch((e) => {
      this.loginIn.next(false);
      this.loading = false;
      let error = this.utilsSvc.getError(e);
      if (error !== "El correo electrónico que ingresaste ya está registrado") {
        this.utilsSvc.presentToast(error);
      }
    });
  }

  /**
   * Watches Firebase AuthState. When it turns authenticated, redirects user to 'email verification'
   * (if required) or to an internal app screen.
   */
  ngOnInit(): void {
    this.sbs.push(
      this.firebaseSvc.authState
        .pipe(
          // Only hear authState during active/valid user login action.
          filter((user) => user !== null && this.loginIn.value),
          tap({
            next: (user) => {
              this.utilsSvc.saveLocalStorage("user", user);
              this.loading = false;
              this.loginIn.next(false);

              console.log(user);

              if (!user.emailVerified) {
                this.utilsSvc.routerLink("/email-verification");
                this.firebaseSvc.sendEmailVerification();
              } else {
                this.utilsSvc.routerLink("/tabs/profile");
                this.resetForm();
              }
            },
            error: (e) => {
              const failure = FailureUtils.errorToFailure(e);
              FailureUtils.log(failure, "LoginPage.ngOnInit");
              if (failure instanceof NoNetworkFailure) {
                this.utilsSvc.presentToast(
                  "Parece que tienes problemas con la conexión a internet. Por favor intente de nuevo."
                );
              } else if (failure instanceof NotFoundFailure) {
                this.utilsSvc.presentToast(
                  "No encontramos el usuario en la app. Por favor regístrate para continuar."
                );
                this.firebaseSvc.logout();
              } else if (failure instanceof PermissionDeniedFailure) {
                this.utilsSvc.presentToast(
                  "Usuario sin privilegios para ejecutar esta acción."
                );
              } else {
                this.utilsSvc.presentToast(
                  "Ocurrió un Error desconocido. Por favor intente de nuevo."
                );
              }
              this.loading = false;
              this.loginIn.next(false);
            },
          })
        )
        .subscribe()
    );
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
    this.sbs.forEach((s) => s.unsubscribe());
  }
}
