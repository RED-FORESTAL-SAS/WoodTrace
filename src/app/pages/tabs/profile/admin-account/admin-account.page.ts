import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { docTypes } from "src/assets/data/document-types";
import { UpdatePasswordComponent } from "./owner/components/update-password/update-password.component";
import { UserService } from "src/app/services/user.service";
import { WtUser } from "src/app/models/wt-user";
import { Observable } from "rxjs";

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

  public user$: Observable<WtUser | null>;

  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) {
    this.user$ = this.userService.user;
  }

  ngOnInit() {
    this.docTypes = docTypes;
    this.user$.subscribe((user) => {
      const type = this.docTypes.find((t) => t.value === user.docType);
      this.docType = type.content;
    });
  }

  async updatePassword() {
    const modal = await this.modalController.create({
      component: UpdatePasswordComponent,
      cssClass: "modal-fink-app",
    });

    await modal.present();
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
    if (this.movil.invalid) {
      return false;
    }
    if (this.fNacimiento.invalid) {
      return false;
    }

    return true;
  }
}
