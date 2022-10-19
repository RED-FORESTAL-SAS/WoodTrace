import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-analysis-form',
  templateUrl: './analysis-form.page.html',
  styleUrls: ['./analysis-form.page.scss'],
})
export class AnalysisFormPage implements OnInit {

  operator = new FormControl('', [Validators.required])
  species = new FormControl('Limón Común', [Validators.required])
  property = new FormControl('', [Validators.required])
  treeQuantity = new FormControl('', [Validators.required, Validators.min(1)])
  priceKg = new FormControl('', [Validators.required])

  operators = [];
  properties = [];
  speciesList = [{ content: 'Limón Común', value: 'Limón Común' }];

  user = {} as User;

  loading: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
    this.species.disable();
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
  }

  ionViewDidEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getOperators();
    this.getProperties();
  }


  getOperators() {
    this.operators = this.user.operators.map(operator => {
      return {
        value: operator,
        content: operator
      }
    })
  }

  getProperties() {
    this.properties = this.user.properties.map(property => {
      return {
        value: property,
        content: property
      }
    })
  }

  submit() {
   let data = {
    operator: this.operator.value,
    property: this.property.value,
    treeQuantity: this.treeQuantity.value,
    priceKg: this.priceKg.value,
    species: this.species.value
   }

   this.utilsSvc.saveLocalStorage('analysis',data);
   this.utilsSvc.routerLink('/tabs/analysis/how-to-use')
   
  }

  resetForm() {
    this.operator.reset();
    this.property.reset();
    this.treeQuantity.reset();
    this.priceKg.reset();
  }


  validator() {
    if (this.operator.invalid) {
      return false;
    }
    if (this.species.invalid) {
      return false;
    }

    if (this.property.invalid) {
      return false;
    }

    if (this.treeQuantity.invalid) {
      return false;
    }

    if (this.priceKg.invalid) {
      return false;
    }


    return true;
  }
}
