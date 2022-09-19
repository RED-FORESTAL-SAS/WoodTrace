import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

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

  
}
