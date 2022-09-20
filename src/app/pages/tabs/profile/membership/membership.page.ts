import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Browser } from '@capacitor/browser';
import * as moment from 'moment';
import { License } from 'src/app/models/license.model';


@Component({
  selector: 'app-membership',
  templateUrl: './membership.page.html',
  styleUrls: ['./membership.page.scss'],
})
export class MembershipPage implements OnInit {

  date = Date.now()
  licenseId = new FormControl('', [Validators.required, Validators.minLength(20)])
  isValidLicense: boolean = null;

  user = {} as User;
  loading: boolean;
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();

    if (this.user.license && this.user.license.id) {
      this.licenseId.setValue(this.user.license.id);
    }

    if (this.user.license && this.user.license.dateInit) {
      this.getRemainingDays(this.user.license.dateInit, this.user.license.dateEnd);
    }
  }

  async getMembership() {
    await Browser.open({ url: 'https://redforestal.com/' });
  };


  /**
   * It creates a license object and then adds it to the licenses collection in Firestore
   * Admin function
   */
  generateLicenses() {
    let numberOfLicense = 5; //How many licenses you want to create

    let license: License = {
      userId: null,
      dateInit: null,
      dateEnd: null,
      months: 3 //Number of months the license will be available
    }

    for (let i = 1; i < numberOfLicense; i++) {
      this.firebaseSvc.addToCollection('licenses', license)
        .then(res => console.log(res))
        .catch(err => console.log(err))
    }
  }

  /**
   * It gets the license from the database and checks if it's valid. If it is, it saves the license in
   * the local storage and calls the redeemLicense function
   */
  getLicense() {
    if (this.licenseId.valid) {
      this.loading = true;
      let ref = this.firebaseSvc.getDataById('licenses', this.licenseId.value).valueChanges().subscribe((license: License) => {
        this.loading = false;

        if (license && !license.dateInit) {
          license.id = this.licenseId.value;
          this.redeemLicense(license.months);
          this.isValidLicense = true;
        }

        if (!license) {
          this.utilsSvc.presentToast('Licencia inválida');
          this.isValidLicense = false;
        }

        if (license && license.dateInit) {
          this.utilsSvc.presentToast('Esta licencia ya fue redimida. Licencia inválida');
          this.isValidLicense = false;
        }

        ref.unsubscribe();
      }, err => {
        this.loading = false;
        console.log(err);
      })
    }
  }


  /**
   * It takes a number of months as a parameter, creates a license object, and then updates the license
   * in the database
   * @param {number} months - number - The number of months to add to the current date.
   */
  redeemLicense(months: number) {
    this.loading = true;

    let license: License = {
      id: this.licenseId.value,
      userId: this.user.id,
      dateInit: moment(Date.now()).format('LLL'),
      dateEnd: moment().add(months, 'months').format('LLL'),
    }

    this.firebaseSvc.UpdateCollection('licenses', license).then(res => {
      this.loading = false;
      this.user.license = license;
      this.utilsSvc.saveLocalStorage('user', this.user);
      this.getRemainingDays(this.user.license.dateInit, this.user.license.dateEnd);

      this.utilsSvc.presentToast('¡Licencia redimida exitosamente!');
    }, err => {
      this.loading = false;
      console.log(err);
    })
  }



  getRemainingDays(dateInit: string, dateEnd: string) {

    let x = moment(dateEnd, 'LLL');
    let y = moment(dateInit, 'LLL');

    let diffInDays = x.diff(y, 'days');
    this.user.license.remainingDays = diffInDays;
  }

}
