import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { WtLicense } from "src/app/models/wt-license";
import { Observable } from "rxjs";
import { UserService } from "src/app/services/user.service";
import { LICENCES_FB_COLLECTION } from "src/app/constants/licenses-fb-collection";
import { limit, orderBy, where } from "src/app/types/query-constraint.type";
import { WtUser } from "src/app/models/wt-user";

@Component({
  selector: "app-membership",
  templateUrl: "./membership.page.html",
  styleUrls: ["./membership.page.scss"],
})
export class MembershipPage implements OnInit {
  date = Date.now();
  redeemCode = new FormControl("", [
    Validators.required,
    Validators.minLength(10),
  ]);
  isValidLicense: boolean = null;
  loading: boolean;

  licencia_vitalicia: boolean;

  public license$: Observable<WtLicense | null>;
  public wtUser: WtUser = {} as WtUser;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private userService: UserService
  ) {
    this.license$ = this.userService.license;
    this.wtUser = this.userService.currentUser;
  }

  ngOnInit() {}

  ionViewWillEnter() {}

  /**
   * It gets the license from the database and checks if it's valid. If it is, it saves the license in
   * the local storage and calls the redeemLicense function
   */
  getLicense() {
    if (this.redeemCode.valid) {
      this.loading = true;
      this.firebaseSvc
        .fetchCollection<WtLicense>(LICENCES_FB_COLLECTION, [
          where("redeemCode", "==", this.redeemCode.value),
          orderBy("ends", "desc"),
          limit(1),
        ])
        .then((license) => {
          this.loading = false;

          if (license.length === 0) {
            this.utilsSvc.presentToast(
              "No hay una licencia identificada con este código. "
            );
            return;
          }

          if (license[0].wtUserId !== "") {
            this.utilsSvc.presentToast(
              "Ya hay un usuario asociado a este código de licencia. "
            );
            return;
          }

          if (license[0].status !== "active") {
            this.utilsSvc.presentToast("Esta licencia se encuentra inactiva. ");
            return;
          }

          this.loading = true;
          license[0].wtUserId = this.wtUser.id;
          this.userService.patchLicense(license[0]);
          this.firebaseSvc.UpdateCollection("wt_licenses", license[0]).then(
            (res) => {
              this.utilsSvc.presentToast("¡Licencia redimida exitosamente!");
              this.loading = false;
            },
            (err) => {
              console.log(err);
              this.utilsSvc.presentToast("No se pudo redimir la licencia.");
              this.loading = false;
            }
          );
        })
        .catch((err) => {
          this.loading = false;
        });
    }
  }
}
