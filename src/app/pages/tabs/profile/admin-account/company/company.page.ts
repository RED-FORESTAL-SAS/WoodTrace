import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { UserService } from "src/app/services/user.service";
import { WtCompany } from "src/app/models/wt-company";
import { Observable } from "rxjs";

@Component({
  selector: "app-company",
  templateUrl: "./company.page.html",
  styleUrls: ["./company.page.scss"],
})
export class CompanyPage implements OnInit {
  /**
   * @todo borrar esta variable cuando se traiga la foto del usuario y se implemente la funcionalidad.
   */
  photo = new FormControl("");
  loading: boolean;
  loadingPhoto: boolean;

  user = {} as User;

  public company$: Observable<WtCompany | null>;

  constructor(private userService: UserService) {
    this.company$ = this.userService.company;
  }

  ngOnInit() {}

  ionViewWillEnter() {}
}
