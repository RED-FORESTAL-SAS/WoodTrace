import { Component, OnInit } from "@angular/core";
import { WtUser } from "src/app/models/wt-user";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.page.html",
  styleUrls: ["./email-verification.page.scss"],
})
export class EmailVerificationPage implements OnInit {
  user = {} as WtUser;

  constructor(
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.user = this.utilsSvc.getCurrentUser();
  }

  logOut() {
    this.firebaseSvc.logout();
  }
}
