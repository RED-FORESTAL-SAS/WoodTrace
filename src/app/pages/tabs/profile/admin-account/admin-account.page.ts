import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { docTypes } from "src/assets/data/document-types";
import { UpdatePasswordComponent } from "./owner/components/update-password/update-password.component";

@Component({
  selector: "app-admin-account",
  templateUrl: "./admin-account.page.html",
  styleUrls: ["./admin-account.page.scss"],
})
export class AdminAccountPage implements OnInit {
  fullName = new FormControl("", [
    Validators.required,
    Validators.minLength(4),
  ]);
  email = new FormControl("", [Validators.required, Validators.email]);
  docType = new FormControl("", [Validators.required]);
  docNumber = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
  ]);

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
    this.docType.setValue(this.user.docType);
    this.docType.disable();
    this.docNumber.setValue(this.user.docNumber);
    this.docNumber.disable();
  }

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

    return true;
  }
}
