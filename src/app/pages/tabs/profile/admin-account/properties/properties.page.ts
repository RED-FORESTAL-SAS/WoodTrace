import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PasswordRequiredComponent } from 'src/app/shared/components/password-required/password-required.component';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.page.html',
  styleUrls: ['./properties.page.scss'],
})
export class PropertiesPage implements OnInit {

  fullName = new FormControl('', [Validators.required, Validators.minLength(4)]);

  user = {} as User;
  loading: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    if (!this.user.properties) {
      this.user.properties = [];
    }
  }

  /**
   * It creates a modal, presents it, and then waits for the modal to be dismissed. 
   * 
   * If the modal is dismissed with data, then it will either add or remove a property. 
   * 
   * If the modal is dismissed without data, then nothing will happen.
   * @param {string} updateType - string - This is the type of update we're doing. In this case, we're
   * either adding or removing a property.
   * @param {number} index - number - the index of the property to be removed
   */
  async passwordRequired(updateType: string, index: number) {
    const modal = await this.modalController.create({
      component: PasswordRequiredComponent,
      cssClass: 'modal-password-required'
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      if (updateType == 'add') {
        this.addProperty()
      } else {
        this.removeProperty(index)
      }
    }
  }

 

/* The above code is adding a new property to the user object and then saving it to the local storage. */
  addProperty() {
    this.user.properties.push(this.fullName.value);
    this.utilsSvc.saveLocalStorage('user', this.user);
    this.updateProperties();
  }

  removeProperty(index) {
    this.user.properties.splice(index, 1);
    this.utilsSvc.saveLocalStorage('user', this.user);
    this.updateProperties();
  }

  updateProperties() {
    this.loading = true;
    this.firebaseSvc.UpdateCollection('users', this.user).then(res => {
      this.fullName.reset();
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
    if (this.fullName.invalid) {
      return false;
    }
    return true;
  }
}
