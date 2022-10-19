import { Component, OnInit } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss'],
})
export class DevicesPage implements OnInit {

  user = {} as User;
  loading: boolean;
  currentDevice = {} as Device;
  

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
   
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.currentDevice = this.utilsSvc.getFromLocalStorage('currentDevice');
  }

  ionViewDidEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.currentDevice = this.utilsSvc.getFromLocalStorage('currentDevice');
  }

  removeDevice(index) {
    this.user.devices.splice(index, 1);
    this.utilsSvc.saveLocalStorage('user', this.user);
    this.updateUser()
  }

  /**
 * It updates the user information in the database.
 */
  updateUser() {

    let data = {
      id: this.utilsSvc.getCurrentUser().id,
      devices: this.user.devices
    }

    this.utilsSvc.presentLoading();
    this.firebaseSvc.UpdateCollection('users', data)
      .then(res => {
        this.utilsSvc.presentToast('Dispositivo desvinculado con éxito');
        this.utilsSvc.dismissLoading();
      }, err => {
        console.log(err);

        this.utilsSvc.presentToast('No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión');
        this.utilsSvc.dismissLoading();
      })
  }
}
