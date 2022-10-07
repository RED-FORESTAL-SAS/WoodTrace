import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  styleUrls: ['./analysis.page.scss'],
})
export class AnalysisPage implements OnInit {

  user = {} as User;

  constructor(
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService
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

  newAnalysis(){
    if(this.user.license && this.user.license.remainingDays){
      this.utilsSvc.routerLink('/tabs/analysis/analysis-form')
    }else{
      this.noMembership();
    }
  }

  noMembership(){
    this.utilsSvc.presentFinkAlert({
      title:'No eres miembro',
      content:'Para realizar análisis de tus árboles primero debes comprar los derechos de membresía.',
      btnText: 'Aceptar',
      route: 'tabs/profile/membership'
    })
    
  }
}
