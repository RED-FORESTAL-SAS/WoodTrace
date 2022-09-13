import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  fullName = new FormControl('', [Validators.required, Validators.minLength(4)])
  email = new FormControl('', [Validators.required, Validators.email])
  docType = new FormControl('', [Validators.required])
  docNumber = new FormControl('', [Validators.required, Validators.minLength(6)])
  photo = new FormControl('');

  docTypes = [];

  user = {} as User;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {

    /* This is a listener that listens for the enter key to be pressed. If the enter key is pressed, and
    the validator() function returns true, the createUser() function is called. */
    window.addEventListener('keyup', e => {
      if (e.key == 'Enter' && this.validator()) {
        this.updateUser()
      }
    })

  }

  ngOnInit() {
    this.docTypes = this.utilsSvc.getDocTypes();
  }


  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getUser();
  }

  getUser() {
    this.email.setValue(this.user.email);
    this.fullName.setValue(this.user.fullName);
    this.docType.setValue(this.user.docType);
    this.docNumber.setValue(this.user.docNumber);
    this.photo.setValue(this.user.photo);
  }


  async uploadPhoto() {

    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      promptLabelHeader: 'Foto de perfil',
      promptLabelPhoto: 'Selecciona una imagen',
      promptLabelPicture: 'Toma una foto',
      source: CameraSource.Prompt
    });
    this.photo.setValue(image.dataUrl);

    this.user.photo = await this.firebaseSvc.uploadPhoto(this.user.id + '/profile', image.dataUrl);

    let user: User = { id: this.user.id, photo: this.user.photo }
    this.firebaseSvc.UpdateCollection('users', user);
    this.utilsSvc.saveLocalStorage('user', this.user)
  }


  updateUser() {

    this.user.fullName = this.fullName.value;
    this.user.docType = this.docType.value;
    this.user.docNumber = this.docNumber.value;

    this.utilsSvc.saveLocalStorage('user', this.user);

    this.utilsSvc.presentLoading();
    this.firebaseSvc.UpdateCollection('users', this.user).then(res => {
      this.utilsSvc.presentToast('Actualizado con éxito');
      this.utilsSvc.dismissLoading();
    }, err => {
      this.utilsSvc.presentToast('No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión');
      this.utilsSvc.dismissLoading();
    })
  }




  saveUserInfo(user: User) {

    this.utilsSvc.presentLoading();
    this.firebaseSvc.addToCollectionById('users', user).then(res => {

      this.utilsSvc.dismissLoading();
    }, err => {
      this.utilsSvc.dismissLoading();
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
