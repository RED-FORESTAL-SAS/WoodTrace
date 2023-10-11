import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { WtCompany } from "src/app/models/wt-company";
import { Observable } from "rxjs";
import { WtLicense } from "src/app/models/wt-license";

@Component({
  selector: "app-company",
  templateUrl: "./company.page.html",
  styleUrls: ["./company.page.scss"],
})
export class CompanyPage { 
  loading: boolean;
  loadingPhoto: boolean;

  public company$: Observable<WtCompany | null>;
  public license$: Observable<WtLicense | null>;

  constructor(private userService: UserService) {
    this.license$ = this.userService.license;
    this.company$ = this.userService.company;
  }
}
