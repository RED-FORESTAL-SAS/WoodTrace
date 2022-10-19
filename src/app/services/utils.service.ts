import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { AlertFinkApp } from '../models/alert.model';
import { DownloadTypeComponent } from '../shared/components/download-type/download-type.component';
import { FinkAlertComponent } from '../shared/components/fink-alert/fink-alert.component';
import { PasswordRequiredComponent } from '../shared/components/password-required/password-required.component';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController
  ) { }

  /**
   * 
   * @returns The current user information in localstorage
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }


  /**
   * It takes a key as a parameter, and returns the value of that key from localStorage
   * @param {string} key - The key to store the data under.
   * @returns The value of the key in localStorage.
   */
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  /**
   * It saves an object to local storage.
   * @param {string} name - The name of the object you want to save.
   * @param {any} object - the object you want to save
   */
  saveLocalStorage(name: string, object: any) {
    localStorage.setItem(name, JSON.stringify(object))
  }


  //======= Loading =======
  async presentLoading() {
    const loading = await this.loadingController.create();
    await loading.present();
  }

  dismissLoading() {
    this.loadingController.dismiss();
  }

  //======= Toast =======
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      color: 'primary',
      position: 'middle',
      buttons: [
        {
          side: 'end',
          icon: 'close',
          handler: () => {
            toast.dismiss();
          }
        }
      ]
    });
    toast.present();
  }


  /**
   * It creates a modal with the FinkAlertComponent component, and returns true if the user clicks the
   * "OK" button, and false if the user clicks the "Cancel" button
   * @param {AlertFinkApp} info - AlertFinkApp - this is the object that will be passed to the modal.
   * @returns A promise that resolves to a boolean.
   */
  async presentFinkAlert(info: AlertFinkApp) {
    const modal = await this.modalController.create({
      component: FinkAlertComponent,
      componentProps: { info },
      cssClass: 'alert-fink-app'
    });

    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      return true;
    } else {
      return false;
    }
  }


  /**
   * It creates a modal, presents it, and returns a boolean value based on the data returned from the
   * modal
   * @returns A boolean value.
   */
  async passwordRequired() {
    const modal = await this.modalController.create({
      component: PasswordRequiredComponent,
      cssClass: 'modal-fink-app'
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      return true
    } else {
      return false
    }
  }

  async downloadReport() {
    const modal = await this.modalController.create({
      component: DownloadTypeComponent,
      cssClass: 'modal-fink-app'
    });

    await modal.present();

  }


  //======= Router =======
  routerLink(url: string) {
    this.router.navigateByUrl(url);
  }


  //======= Close Modal =======
  closeModal() {
    this.modalController.dismiss();
  }


  //======= Firebase Errors Handler =======
  getError(error: string) {

    if (error == 'FirebaseError: Firebase: The password is invalid or the user does not have a password. (auth/wrong-password).') {
      return 'La contraseña es inválida';
    }

    if (error == 'FirebaseError: Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).') {
      return 'Este usuario no existe. Regístrate para acceder';
    }

    if (error == 'FirebaseError: Firebase: The email address is already in use by another account. (auth/email-already-in-use).') {
      return 'El correo electrónico que ingresaste ya está registrado';
    }

  }


  /**
   * It returns the current date in the format of "Month Day, Year Time"
   * @returns The current date in the format of Month, Day, Year, Time
   */
  getCurrentDate() {
    return moment(Date.now()).format('LLL');
  }

  /**
   * It takes two dates in string format and returns the difference in days between them
   * @param {string} dateInit - The date you want to start counting from.
   * @param {string} dateEnd - The end date of the range.
   * @returns The difference in days between two dates.
   */
  getDiffDays(dateInit: string, dateEnd: string) {

    let x = moment(dateEnd, 'LLL');
    let y = moment(dateInit, 'LLL');

    let diffInDays = x.diff(y, 'days');
    return diffInDays;
  }
}
