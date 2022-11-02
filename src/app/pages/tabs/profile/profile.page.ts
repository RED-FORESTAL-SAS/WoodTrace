import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { PdfService } from 'src/app/services/pdf.service';
import { UtilsService } from 'src/app/services/utils.service';


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

      if (this.user.license.remainingDays <= 0) {
        this.firebaseSvc.deleteFromCollection('licenses', this.user.license.id);
      }
    }
  }


  async passwordRequired() {
    let passwordValid = await this.utilsSvc.passwordRequired();
    if (passwordValid) {
      this.utilsSvc.routerLink('/tabs/profile/admin-account')
    }
  }


  logOut() {
    this.firebaseSvc.logout();
  }
}
