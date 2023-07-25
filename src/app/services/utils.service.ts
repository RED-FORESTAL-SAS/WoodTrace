import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  AlertOptions,
  LoadingController,
  ModalController,
  ModalOptions,
  ToastController,
} from "@ionic/angular";
import * as moment from "moment";
import { AlertFinkApp } from "../models/alert.model";
import { DownloadTypeComponent } from "../shared/components/download-type/download-type.component";
import { FinkAlertComponent } from "../shared/components/fink-alert/fink-alert.component";
import { PasswordRequiredComponent } from "../shared/components/password-required/password-required.component";
import { Browser } from "@capacitor/browser";

@Injectable({
  providedIn: "root",
})
export class UtilsService {
  constructor(
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  async openUrl(url: string) {
    await Browser.open({ url });
  }

  /**
   * It creates a modal, presents it, and returns the data from the modal when it's dismissed
   * @param {ModalOptions} opts - ModalOptions - This is the options object that we pass to the modal.
   * @returns The data that is returned from the modal.
   */
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalController.create(opts);

    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      return data;
    }
  }

  /**
   *
   * @returns The current user information in localstorage
   * @deprecated Use UserService.getCurrentUser() instead.
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  /**
   * It takes a key as a parameter, and returns the value of that key from localStorage
   *
   * @param {string} key - The key to store the data under.
   * @returns The value of the key in localStorage.
   * @deprecated Use localStorageRepository.fetch() instead.
   */
  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  /**
   * It saves an object to local storage.
   *
   * @param {string} name - The name of the object you want to save.
   * @param {any} object - the object you want to save
   * @deprecated Use localStorageRepository.save() instead.
   */
  saveLocalStorage(name: string, object: any) {
    localStorage.setItem(name, JSON.stringify(object));
  }

  /**
   * @deprecated Use localStorageRepository.delete() instead.
   */
  deleteFromLocalStorage(name: string) {
    localStorage.removeItem(name);
  }

  //======= Loading =======
  async presentLoading(message?: string) {
    const loading = await this.loadingController.create({
      message,
      mode: "ios",
    });
    await loading.present();
  }

  async dismissLoading(): Promise<void> {
    this.loadingController.dismiss();
  }

  //======= Toast =======
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      color: "primary",
      position: "middle",
      buttons: [
        {
          side: "end",
          icon: "close",
          handler: () => {
            toast.dismiss();
          },
        },
      ],
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
      cssClass: "alert-fink-app",
    });

    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      return true;
    } else {
      return false;
    }
  }

  async presentAlertConfirm(opt: AlertOptions) {
    const alert = await this.alertController.create(opt);

    return await alert.present();
  }

  /**
   * It creates a modal, presents it, and returns a boolean value based on the data returned from the
   * modal
   * @returns A boolean value.
   */
  async passwordRequired() {
    const modal = await this.modalController.create({
      component: PasswordRequiredComponent,
      cssClass: "modal-fink-app",
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      return true;
    } else {
      return false;
    }
  }

  async downloadReport(report) {
    const modal = await this.modalController.create({
      component: DownloadTypeComponent,
      cssClass: "modal-fink-app",
      componentProps: { report },
      showBackdrop: true,
      backdropDismiss: false,
    });

    await modal.present();
  }

  //======= Router =======
  routerLink(url: string) {
    this.router.navigateByUrl(url);
  }

  //======= Close Modal =======
  closeModal(data?: any) {
    this.modalController.dismiss(data);
  }

  //============== Generar número aleatorio ===========
  randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //======= Firebase Errors Handler =======
  getError(error: string) {
    if (
      error ==
      "FirebaseError: Firebase: The password is invalid or the user does not have a password. (auth/wrong-password)."
    ) {
      return "La contraseña es inválida";
    }

    if (
      error ==
      "FirebaseError: Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found)."
    ) {
      return "Este usuario no existe. Regístrate para acceder";
    }

    if (
      error ==
      "FirebaseError: Firebase: The email address is already in use by another account. (auth/email-already-in-use)."
    ) {
      return "El correo electrónico que ingresaste ya está registrado";
    }
  }

  /**
   * It returns the current date in the format of "Month Day, Year Time"
   *
   * @returns The current date in the format of Month, Day, Year, Time
   * @deprecated Moment.js is deprecated, use Firestore Timestamp or Javascript Date instead.
   */
  getCurrentDate() {
    moment.locale("es");
    return moment(Date.now()).format("MMMM D YYYY, h:mm a");
  }

  /**
   * It takes two dates in string format and returns the difference in days between them
   *
   * @param {string} dateInit - The date you want to start counting from.
   * @param {string} dateEnd - The end date of the range.
   * @returns The difference in days between two dates.
   * @deprecated Moment.js is deprecated, use Firestore Timestamp or Javascript Date instead.
   */
  getDiffDays(dateInit: string, dateEnd: string) {
    let x = moment(dateEnd, "MMMM D YYYY, h:mm a");
    let y = moment(dateInit, "MMMM D YYYY, h:mm a");

    let diffInDays = x.diff(y, "days");
    return diffInDays;
  }
}
