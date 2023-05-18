import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { PasswordRequiredComponent } from "src/app/shared/components/password-required/password-required.component";

@Component({
  selector: "app-properties",
  templateUrl: "./properties.page.html",
  styleUrls: ["./properties.page.scss"],
})
export class PropertiesPage implements OnInit {
  fullName = new FormControl("", [
    Validators.required,
    Validators.minLength(4),
  ]);

  user = {} as User;
  loading: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    if (!this.user.properties) {
      this.user.properties = [];
    }
  }

  /* The above code is adding a new property to the user object and then saving it to the local storage. */
  addProperty() {
    this.user.properties.push(this.fullName.value);
    this.utilsSvc.saveLocalStorage("user", this.user);
    this.updateProperties();
  }

  removeProperty(index) {
    this.user.properties.splice(index, 1);
    this.utilsSvc.saveLocalStorage("user", this.user);
    this.updateProperties();
  }

  updateProperties() {
    // this.loading = true;
    // this.firebaseSvc.UpdateCollection('users', this.user).then(res => {
    //   this.fullName.reset();
    //   this.loading = false;
    // }, err => {
    //   this.utilsSvc.presentToast('No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión');
    //   this.loading = false;
    // })
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
