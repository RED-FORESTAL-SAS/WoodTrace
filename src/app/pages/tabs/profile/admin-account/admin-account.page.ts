import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { docTypes } from "src/assets/data/document-types";
import { UpdatePasswordComponent } from "./owner/components/update-password/update-password.component";
import { UserService } from "src/app/services/user.service";
import { WtUser } from "src/app/models/wt-user";
import { Observable, Subscription } from "rxjs";
import { Timestamp } from "../../../../../app/types/timestamp.type";
import { UtilsService } from "src/app/services/utils.service";
import { take, tap } from "rxjs/operators";
import { FirebaseService } from "src/app/services/firebase.service";

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

  loading: boolean;
  loadingPhoto: boolean;

  private sbs: Subscription[] = [];

  public user$: Observable<WtUser | null>;

  constructor(
    private userService: UserService,
    private utilsSvc: UtilsService,
    private modalController: ModalController,
    private firebaseSvc: FirebaseService
  ) {
    this.user$ = this.userService.user;
  }

  ngOnInit() {
    this.docTypesList = docTypes;
    this.sbs.push(
      this.user$.subscribe((user) => {
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

  eliminarCuenta() {
    this.utilsSvc.presentAlertConfirm({
      header: "Eliminar la cuenta",
      message: "¿Está seguro de que desea eliminar la cuenta?",
      buttons: [
        {
          text: "Cancelar",
          handler: () => {},
        },
        {
          text: "Eliminar",
          handler: () => {
            this.sbs.push(
              this.userService.user
                .pipe(
                  take(1),
                  tap({
                    next: async (user) => {
                      const patchData = {
                        ...user,
                        activo: false,
                      };
                      this.userService.patchUser(patchData);
                      this.loading = true;
                      this.firebaseSvc
                        .UpdateCollection("wt_users", patchData)
                        .then(
                          (res) => {
                            this.utilsSvc.presentToast(
                              "Su usuario ha sido eliminado con éxito. Ya no podrá acceder a la aplicación. "
                            );
                            this.logOut();
                            this.loading = false;
                          },
                          (err) => {
                            console.log(err);

                            this.utilsSvc.presentToast(
                              "No tienes conexión actualmente los datos se subiran una vez se restablesca la conexión"
                            );
                            this.loading = false;
                          }
                        );
                    },
                  })
                )
                .subscribe()
            );
          },
        },
      ],
    });
  }

  logOut() {
    this.firebaseSvc.logout();
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
