import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-password-required',
  templateUrl: './password-required.component.html',
  styleUrls: ['./password-required.component.scss'],
})
export class PasswordRequiredComponent implements OnInit {

  password = new FormControl('', [Validators.required]);
  loading: boolean;

  user = {} as User;

  constructor(
    private modalController: ModalController,
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService
  ) {
   
   }

  ngOnInit() {
    this.user = this.utilsSvc.getCurrentUser();
  }


  close() {
    this.modalController.dismiss();
  }

  checkPassword() {
    
    this.user.password = this.password.value
    
    this.loading = true;

    this.firebaseSvc.Login(this.user).then(res => {
      this.loading = false;
      this.modalController.dismiss({checked: true});
      console.log(res);
      
    }, err => {
      console.log(err);
      
      this.loading = false;
      let error = this.utilsSvc.getError(err);

      if (error !== 'El correo electrónico que ingresaste ya está registrado') {
        this.utilsSvc.presentToast(error);
      }

    })
  }

  validator() {
    if (this.password.invalid) {
      return false;
    }

    return true;
  }
}

