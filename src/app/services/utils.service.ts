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


  //======= Document types =======

  getDocTypes() {
    let docTypes = [
      { value: 1, content: 'Cédula' },
      { value: 2, content: 'Cédula de Extranjería' },
      { value: 3, content: 'Número de Identificación Tributaria' },
      { value: 4, content: 'Permiso Especial de Permanencia' }
    ]

    return docTypes;
  }

  //======= Help Slides =======

  getHelpSlidesData() {
    let helpSlides = [
      {
        title: '¡Te damos la bienvenida!',
        subtitle: '¡Llevemos el manejo de tus cultivos al siguiente nivel!',
        indication: 'Lo primero que debes hacer es: ',
        icon: 'assets/icon/imagen-registrate.svg',
        message: 'Una vez hagas parte de nuestra comunidad podrás adqurir la membresía para el análisis de tus árboles.'
      },
      {
        title: 'Analiza tus árboles',
        subtitle: '¡Realiza un seguimiento eficiente de tus cultivos!',
        indication: 'Realiza un análisis automatizado de tus árboles.',
        icon: 'assets/icon/imagen-analiza.svg',
        message: '¡Podrás conocer el número de frutos totales y sus diferentes estados de madurez!'
      },
      {
        title: 'Reportes a la mano',
        subtitle: '¡Gestiona tu producción de manera inteligente!',
        indication: 'Genera proyecciones de producción y ventas en tu cultivo.', 
        icon: 'assets/icon/imagen-reporteseguro.svg',
        message: 'Descarga de forma segura los reportes y toma decisiones informadas para el futuro de tu cultivo.'
      },
    ]

    return helpSlides;
  }

}
