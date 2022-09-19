import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Browser } from '@capacitor/browser';


@Component({
  selector: 'app-membership',
  templateUrl: './membership.page.html',
  styleUrls: ['./membership.page.scss'],
})
export class MembershipPage implements OnInit {

  date = Date.now()
  license = new FormControl('', [Validators.required, Validators.minLength(12)])

  user = {} as User;
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ){ }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.user = this.utilsSvc.getCurrentUser();
    this.license.setValue(this.user.license);
  }

  async getMembership(){
    await Browser.open({ url: 'https://redforestal.com/' });
  };
}
