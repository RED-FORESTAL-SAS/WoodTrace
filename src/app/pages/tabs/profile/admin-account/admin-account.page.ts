import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { docTypes } from "src/assets/data/document-types";
import { UpdatePasswordComponent } from "./owner/components/update-password/update-password.component";
import { UserService } from "src/app/services/user.service";
import { WtUser } from "src/app/models/wt-user";
import { Observable, Subscription } from "rxjs";
import { Timestamp } from "../../../../../app/types/timestamp.type";

@Component({
  selector: "app-admin-account",
  templateUrl: "./admin-account.page.html",
  styleUrls: ["./admin-account.page.scss"],
})
export class AdminAccountPage implements OnInit, OnDestroy {
  fullName = new FormControl("", []);
  email = new FormControl("", []);
  movil = new FormControl("", []);
  fNacimiento = new FormControl(Timestamp, []);
  docType = new FormControl("", []);
  docNumber = new FormControl("", []);

  docTypesList = [];

  // user = {} as User;

  loading: boolean;
  loadingPhoto: boolean;

  private sbs: Subscription[] = [];

  public user$: Observable<WtUser | null>;

  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) {
    this.user$ = this.userService.user;
  }

  ngOnInit() {
    this.docTypesList = docTypes;
    this.sbs.push(
      this.user$.subscribe((user) => {
        console.log(user);
        const type = this.docTypesList.find((t) => t.value === user.docType);
        this.docType = type.content;
      })
    );
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
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
