import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { User } from "src/app/models/user.model";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import { Geolocation } from "@capacitor/geolocation";
import { colombia } from "src/assets/data/colombia-departments-towns";
import { ModalController } from "@ionic/angular";
import { PasswordRequiredComponent } from "src/app/shared/components/password-required/password-required.component";
import { UserService } from "src/app/services/user.service";
import { map } from "rxjs/operators";
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

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private userService: UserService,
    private modalController: ModalController
  ) {
    this.company$ = this.userService.company;
  }

  ngOnInit() {}

  ionViewWillEnter() {}
}
