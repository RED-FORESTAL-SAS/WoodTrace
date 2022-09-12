import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {


  email = new FormControl('', [Validators.required, Validators.email])

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {

    /* This is a listener that listens for the enter key to be pressed. If the enter key is pressed, and
 the validator() function returns true, the sendRecoveryEmail() function is called. */
    window.addEventListener('keyup', e => {
      if (e.key == 'Enter' && this.validator()) {
        this.sendRecoveryEmail();
      }
    })
  }

  ngOnInit() {
  }


  sendRecoveryEmail() {
    this.utilsSvc.presentLoading();
    this.firebaseSvc.sendRecoveryEmail(this.email.value).then(res => {
      this.utilsSvc.presentToast(`Te hemos enviado un correo a ${this.email.value} para que puedas recuperar tu contraseña`);
      this.utilsSvc.routerLink('/login');
      this.email.reset()
      this.utilsSvc.dismissLoading();
    }, err => {
      console.log(err);
      this.utilsSvc.presentToast('Ha ocurrido un error, intenta de nuevo');
      this.utilsSvc.dismissLoading();
    })
  }

  /**
 * If the email invalid, return false. Otherwise, return true
 * @returns A boolean value.
 */
  validator() {
    if (this.email.invalid) {
      return false;
    }

    return true;
  }
}
