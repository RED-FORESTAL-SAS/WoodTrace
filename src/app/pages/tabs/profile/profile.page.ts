import { Component, OnInit } from "@angular/core";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { PdfService } from "src/app/services/pdf.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getLicenseRemainingDays();
  }

  currentUser(): User {
    return this.utilsSvc.getCurrentUser();
  }

  /**
   * It calculates the difference between two dates and returns the number of days
   */
  async getLicenseRemainingDays() {
    let currentUser: User = this.currentUser();

    if (currentUser.license && currentUser.license.dateInit) {
      let currentDate = this.utilsSvc.getCurrentDate();
      currentUser.license.remainingDays = this.utilsSvc.getDiffDays(
        currentDate,
        currentUser.license.dateEnd
      );
      this.utilsSvc.saveLocalStorage("user", currentUser);

      if (currentUser.license.remainingDays <= 0) {
        await this.firebaseSvc.deleteFromCollection(
          "licenses",
          currentUser.license.id
        );

        currentUser.license = null;
        this.utilsSvc.saveLocalStorage("user", currentUser);
      }
    }
  }

  // async passwordRequired() {
  //   let passwordValid = await this.utilsSvc.passwordRequired();
  //   if (passwordValid) {
  //     this.utilsSvc.routerLink('/tabs/profile/admin-account')
  //   }
  // }

  logOut() {
    this.firebaseSvc.logout();
  }
}
