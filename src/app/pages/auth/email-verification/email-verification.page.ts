import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.page.html",
  styleUrls: ["./email-verification.page.scss"],
})
export class EmailVerificationPage {
  constructor(private router: Router, private userService: UserService) {}

  /**
   * Redirect to login page.
   */
  public async goToLogin(): Promise<void> {
    await this.userService.signOut();
    this.router.navigate(["/login"]);
  }
}
