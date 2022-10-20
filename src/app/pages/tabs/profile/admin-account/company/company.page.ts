import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Geolocation } from '@capacitor/geolocation';
import { colombia } from 'src/assets/data/colombia-departments-towns';
import { ModalController } from '@ionic/angular';
import { PasswordRequiredComponent } from 'src/app/shared/components/password-required/password-required.component';

@Component({
  selector: 'app-company',
  templateUrl: './company.page.html',
  styleUrls: ['./company.page.scss'],
})
export class CompanyPage implements OnInit {

  companyName = new FormControl('', [Validators.required, Validators.minLength(4)]);
  companyAddress = new FormControl('', [Validators.required, Validators.minLength(10)]);
  nit = new FormControl('', [Validators.required, Validators.minLength(7)]);
  country = new FormControl('', [Validators.required]);
  department = new FormControl('', [Validators.required]);
  town = new FormControl('', [Validators.required]);
  photo = new FormControl('');

  latitude: number;
  longitude: number;

  user = {} as User;

  loading: boolean;
  loadingPhoto: boolean;

  departments = [];
  towns = [];

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) {

  }

  ngOnInit() {

  }


  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getUser();
    this.getDeparments();
  }


  /**
   * We're using the Object.keys() method to get an array of the keys of the colombia object, then we're
   * using the map() method to iterate over the array and return an array of objects with the value and
   * content properties
   */
  getDeparments() {
    this.departments = Object.keys(colombia).map(department => {
      return {
        value: department,
        content: department
      }
    })
  }


  /**
   * It loops through the object and if the value of the department is equal to the key of the object,
   * it maps the value of the object to the towns array
   */
  getTowns() {
    this.town.reset();
    for (let [key, value] of Object.entries(colombia)) {
      if (this.department.value == key) {
        this.towns = value.map(department => {
          return {
            value: department,
            content: department
          }
        })
      }
    }
  }


  /**
   * This function sets the values of the form fields to the values of the user object
   */
  getUser() {
    this.companyName.setValue(this.user.companyName);
    this.companyAddress.setValue(this.user.companyAddress);
    this.nit.setValue(this.user.nit);
    this.country.setValue('Colombia');
    this.country.disable();
    this.department.setValue(this.user.department);
    this.town.setValue(this.user.town);
    this.photo.setValue(this.user.photo);
    if (this.user.location && this.user.location.latitude) {
      this.latitude = this.user.location.latitude;
      this.longitude = this.user.location.longitude;
    }
  }

  /**
   * The function calls the Geolocation plugin's getCurrentPosition() function, which returns a promise
   * that resolves to a Coordinates object
   */
  async getCurrentPosition() {
    this.utilsSvc.presentLoading();

    const coordinates = await Geolocation.getCurrentPosition();
    this.utilsSvc.dismissLoading();

    if (coordinates && coordinates.coords) {
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
    }
  }


  /**
   * It takes a photo, uploads it to Firebase Storage, and then updates the user's profile photo in the
   * database
   */
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

    this.loadingPhoto = true;
    this.user.photo = await this.firebaseSvc.uploadPhoto(this.user.id + '/profile', image.dataUrl);
    this.photo.setValue(this.user.photo);
    this.loadingPhoto = false;

    this.updateUser();
    this.utilsSvc.saveLocalStorage('user', this.user)
  }


  /**
   * It updates the user information in the database.
   */
  updateUser() {

    let location = { latitude: this.latitude, longitude: this.longitude }

    this.user.companyName = this.companyName.value;
    this.user.companyAddress = this.companyAddress.value;
    this.user.country = this.country.value;
    this.user.department = this.department.value;
    this.user.town = this.town.value;
    this.user.nit = this.nit.value;
    this.user.location = location

    this.utilsSvc.saveLocalStorage('user', this.user);

    this.loading = true;
    this.firebaseSvc.UpdateCollection('users', this.user).then(res => {
      this.utilsSvc.presentToast('Actualizado con éxito');
      this.loading = false;
    }, err => {
      console.log(err);

      this.utilsSvc.presentToast('No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión');
      this.loading = false;
    })
  }


  /**
   * If the form field are invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.companyName.invalid) {
      return false;
    }
    if (this.companyAddress.invalid) {
      return false;
    }
    if (this.nit.invalid) {
      return false;
    }
    if (this.country.invalid) {
      return false;
    }
    if (this.department.invalid) {
      return false;
    }
    if (this.town.invalid) {
      return false;
    }

    return true;
  }
}
