import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PasswordRequiredComponent } from 'src/app/shared/components/password-required/password-required.component';
import * as moment from 'moment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user = {} as User;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
  }

  ionViewDidEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getLicenseRemainingDays();
  }

  /**
 * It calculates the difference between two dates and returns the number of days
 */
  getLicenseRemainingDays() {
    if (this.user.license && this.user.license.dateInit) {
      let currentDate = this.utilsSvc.getCurrentDate();
      this.user.license.remainingDays = this.utilsSvc.getDiffDays(currentDate, this.user.license.dateEnd);
    
      if(this.user.license.remainingDays <= 0){
       this.firebaseSvc.deleteFromCollection('licenses', this.user.license.id);
      }
    }
  }

  /**
   * The function creates a modal, presents it, and then, if the modal is dismissed with data, it
   * navigates to the admin-account page
   */
  async passwordRequired() {
    const modal = await this.modalController.create({
      component: PasswordRequiredComponent,
      cssClass: 'modal-fink-app'
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.utilsSvc.routerLink('/tabs/profile/admin-account')
    }
  }

  logOut() {
    this.firebaseSvc.logout();
  }
}
