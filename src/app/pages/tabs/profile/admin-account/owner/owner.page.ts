import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PasswordRequiredComponent } from 'src/app/shared/components/password-required/password-required.component';
import { docTypes } from 'src/assets/data/document-types';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.page.html',
  styleUrls: ['./owner.page.scss'],
})
export class OwnerPage implements OnInit {

  fullName = new FormControl('', [Validators.required, Validators.minLength(4)])
  email = new FormControl('', [Validators.required, Validators.email]);
  docType = new FormControl('', [Validators.required])
  docNumber = new FormControl('', [Validators.required, Validators.minLength(6)])
  photo = new FormControl('');

  docTypes = [];

  user = {} as User;

  loading: boolean;
  loadingPhoto: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) {

  }

  ngOnInit() {
    this.docTypes = docTypes;
  }


  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getUser();
  }


 /**
  * It creates a modal, presents it, and then waits for the modal to be dismissed. 
  * 
  * If the modal is dismissed with data, then the user is updated. 
  * 
  * If the modal is dismissed without data, then the user is not updated.
  */
  async passwordRequired() {
    const modal = await this.modalController.create({
      component: PasswordRequiredComponent,
      cssClass: 'modal-password-required'
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.updateUser();
    }
  }


/**
 * We're setting the values of the form controls to the values of the user object
 */
  getUser() {
    this.email.setValue(this.user.email)
    this.email.disable();
    this.fullName.setValue(this.user.fullName);
    this.docType.setValue(this.user.docType);
    this.docNumber.setValue(this.user.docNumber);
    this.photo.setValue(this.user.photo);
  }


 /**
  * It updates the user information in the database.
  */
  updateUser() {

    this.user.fullName = this.fullName.value;
    this.user.docType = this.docType.value;
    this.user.docNumber = this.docNumber.value;

    this.utilsSvc.saveLocalStorage('user', this.user);

    this.loading = true;
    this.firebaseSvc.UpdateCollection('users', this.user).then(res => {
      this.utilsSvc.presentToast('Actualizado con éxito');
      this.loading = false;
    }, err => {
      this.utilsSvc.presentToast('No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión');
      this.loading = false;
    })
  }



  /**
   * If the form field are invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.email.invalid) {
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

    return true;
  }
}
