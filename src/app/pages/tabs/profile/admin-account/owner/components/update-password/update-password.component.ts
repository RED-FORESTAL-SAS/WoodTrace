import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
})
export class UpdatePasswordComponent implements OnInit {

  password = new FormControl('', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&.])[A-Za-z\d$@$!%*?&].{8,16}')]);
  confirmPassword = new FormControl('', [Validators.required]);

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

 /**
  * It updates the user password.
  */
  updatePassword() {
    this.loading = true;
    this.firebaseSvc.changeUserPassword(this.password.value).then(res => {
      this.loading = false;
      this.utilsSvc.presentToast('Contraseña actualizada con éxito');
      this.close();
    }, err => {
      this.loading = false;
      this.utilsSvc.presentToast(err)
    })
  }

  validator() {
    if (this.password.invalid) {
      return false;
    }

    if (this.confirmPassword.invalid) {
      return false;
    }

    if (this.confirmPassword.value !== this.password.value) {
      return false;
    }

    return true;
  }
}
