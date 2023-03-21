import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { docTypes } from "src/assets/data/document-types";

@Component({
  selector: "app-admin-account",
  templateUrl: "./admin-account.page.html",
  styleUrls: ["./admin-account.page.scss"],
})
export class AdminAccountPage implements OnInit {
  fullName = new FormControl("", []);
  email = new FormControl("", []);
  movil = new FormControl("", []);
  fNacimiento = new FormControl("", []);
  docType = new FormControl("", []);
  docNumber = new FormControl("", []);

  docTypes = [];

  user = {} as User;

  loading: boolean;
  loadingPhoto: boolean;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.docTypes = docTypes;
  }

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
    this.getUser();
  }

  /**
   * We're setting the values of the form controls to the values of the user object
   */
  getUser() {
    this.email.setValue(this.user.email);
    this.email.disable();
    this.fullName.setValue(this.user.fullName);
    this.fullName.disable();
    /**
     * @todo hacer que se vea el content y no el value.
     */
    this.docType.setValue(this.user.docType);
    this.docType.disable();
    this.docNumber.setValue(this.user.docNumber);
    this.docNumber.disable();
    this.movil.setValue(this.user.movil);
    this.movil.disable();
    /**
     * @todo hacer que la fecha de nacimiento se pueda ver. Hay un conflicto con los tipos de datos.
     */
    // this.fNacimiento.setValue(this.user.fNacimiento);
    this.fNacimiento.disable();
  }

  updatePassword() {}

  /**
   * If the form field are invalid, return false. Otherwise, return true
   * @returns A boolean value.
   */
  validator() {
    if (this.email.invalid) {
      return false;
    }
    if (this.fullName.invalid) {
      return false;
    }
    if (this.docType.invalid) {
      return false;
    }
    if (this.docNumber.invalid) {
      return false;
    }
    if (this.movil.invalid) {
      return false;
    }
    if (this.fNacimiento.invalid) {
      return false;
    }

    return true;
  }
}
