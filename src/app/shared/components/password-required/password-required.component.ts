import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Observable } from "rxjs";
import { User } from "src/app/models/user.model";
import { WtUser } from "src/app/models/wt-user";
import { FirebaseService } from "src/app/services/firebase.service";
import { UserService } from "src/app/services/user.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-password-required",
  templateUrl: "./password-required.component.html",
  styleUrls: ["./password-required.component.scss"],
})
export class PasswordRequiredComponent implements OnInit {
  password = new FormControl("", [Validators.required]);
  loading: boolean;

  public user$: Observable<WtUser | null>;

  constructor(
    private modalController: ModalController,
    private utilsSvc: UtilsService,
    private userService: UserService,
    private firebaseSvc: FirebaseService
  ) {}

  ngOnInit() {}

  close() {
    this.modalController.dismiss();
  }

  /**
   * The function checks the password and if it's correct, it logs the user in
   */
  checkPassword() {
    //set password in the user object
    // this.user.password = this.password.value;
    // this.loading = true;
    // this.firebaseSvc.Login(this.user).then(res => {
    //   this.loading = false;
    //   this.modalController.dismiss({checked: true});
    // }, err => {
    //   this.loading = false;
    //   let error = this.utilsSvc.getError(err);
    //   if (error !== 'El correo electrónico que ingresaste ya está registrado') {
    //     this.utilsSvc.presentToast(error);
    //   }
    // })
  }

  validator() {
    if (this.password.invalid) {
      return false;
    }

    return true;
  }
}
