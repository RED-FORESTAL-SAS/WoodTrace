import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PasswordRequiredComponent } from 'src/app/shared/components/password-required/password-required.component';

@Component({
  selector: 'app-operators',
  templateUrl: './operators.page.html',
  styleUrls: ['./operators.page.scss'],
})
export class OperatorsPage implements OnInit {

  fullName = new FormControl('', [Validators.required, Validators.minLength(4)]);

  user = {} as User;
  loading: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
  }


  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    if(!this.user.operators){
      this.user.operators = [];
    }
  }

  /**
   * It creates a modal, presents it, and then waits for the modal to be dismissed. 
   * 
   * If the modal is dismissed with data, then it checks the updateType and either calls addOperator()
   * or removeOperator(). 
   * 
   * If the modal is dismissed without data, then nothing happens.
   * @param {string} updateType - string - This is the type of update that is being performed. In this
   * case, it's either 'add' or 'remove'.
   * @param {number} index - number - the index of the operator to be removed
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
        this.addOperator()
      } else {
        this.removeOperator(index)
      }
    }
  }


  
 /* The above code is adding and removing operators from the user object. */
  addOperator(){
    this.user.operators.push(this.fullName.value);
    this.utilsSvc.saveLocalStorage('user', this.user);
    this.updateOperators();
  }

  removeOperator(index){
    this.user.operators.splice(index, 1);
    this.utilsSvc.saveLocalStorage('user', this.user);
    this.updateOperators();
  }

  updateOperators() {
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
