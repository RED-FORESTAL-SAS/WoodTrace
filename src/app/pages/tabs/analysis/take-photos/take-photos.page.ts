import { Component, OnDestroy, OnInit } from "@angular/core";
import { CameraSource } from "@capacitor/camera";
import { UtilsService } from "src/app/services/utils.service";
import { FormControl, Validators } from "@angular/forms";
import { ReportService } from "src/app/services/report.service";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map, skipWhile, switchMap, take, tap } from "rxjs/operators";
import { ESPECIES } from "src/assets/data/especies";
import { EspecieModalComponent } from "src/app/shared/components/especie-modal/especie-modal.component";
import { ModalController } from "@ionic/angular";
import { WtWood } from "src/app/models/wt-wood";
import { LoadingModalComponent } from "src/app/shared/components/loading-modal/loading-modal.component";
import { ErrorModalComponent } from "src/app/shared/components/error-modal/error-modal.component";
import {
  CameraPermissionsFailure,
  CameraService,
} from "src/app/services/camera.service";

@Component({
  selector: "app-take-photos",
  templateUrl: "./take-photos.page.html",
  styleUrls: ["./take-photos.page.scss"],
})
export class TakePhotosPage implements OnInit, OnDestroy {
  especie = new FormControl("", [Validators.required]);
  photo = new FormControl("");
  loadingPhoto: boolean;

  especies = ESPECIES;

  private sbs: Subscription[] = [];

  /** BehaviourSubject to deal with event "saveWood". */
  private saveWoodEvent = new BehaviorSubject<number>(null);

  /** Observable with active report or null. */
  public activeWood$: Observable<WtWood | null>;
  /** Observable with boolean indicating if there is an active report or not. */
  public hasActiveWood$: Observable<boolean>;

  /** Modal with Freddy, to show during loading. */
  private modalLoading: HTMLIonModalElement;
  /** Modal with Freddy, to show on error. */
  private modalError: HTMLIonModalElement;

  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService,
    private modalController: ModalController,
    private cameraService: CameraService
  ) {
    this.activeWood$ = this.reportService.activeWood;
    this.hasActiveWood$ = this.reportService.activeWood.pipe(
      map((wood) => !!wood)
    );
  }

  /**
   * Build subscriptions/event handlers for component, every time Page is 'Entered'.
   */
  ngOnInit(): void {
    this.saveWoodHandler();
    this.populateForm();
  }

  /**
   * Create modals every time Page is 'Entered'.
   */
  ionViewDidEnter() {
    this.createModals();
  }

  /**
   * Destroy subscriptions/event handlers for component, every time Page is 'Left'.
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
    this.saveWoodEvent.complete();
  }

  /**
   * Populate form with active wood data.
   */
  populateForm() {
    this.sbs.push(
      this.reportService.activeWood
        .pipe(
          take(1),
          tap({
            next: (wood) => {
              if (wood) {
                this.especie.setValue(wood.especieDeclarada);
                this.photo.setValue(wood.path);
              }
            },
          })
        )
        .subscribe()
    );
  }

  /**
   * Funciona para cuando se escoge seleccionar una foto del dispositovo
   */
  async uploadPhoto() {
    const photo = await this.cameraService
      .pickOrTakePhoto({
        source: CameraSource.Photos,
      })
      .catch((e) => {
        if (e instanceof CameraPermissionsFailure) {
          this.utilsSvc.presentToast(e.message);
        } else {
          this.utilsSvc.presentToast("Ocurrió un error con la cámara.");
        }
      });

    if (!photo) return;

    this.loadingPhoto = true;
    this.photo.setValue(photo.dataUrl);
    this.loadingPhoto = false;
  }

  /**
   * Funciona para cuando se toma una foto con la camara del dispositivo
   */
  async takePhoto() {
    const photo = await this.cameraService
      .pickOrTakePhoto({
        source: CameraSource.Camera,
      })
      .catch((e) => {
        if (e instanceof CameraPermissionsFailure) {
          this.utilsSvc.presentToast("No se puede acceder a la cámara.");
        } else {
          this.utilsSvc.presentToast("Ocurrió un error con la cámara.");
        }
      });
    if (!photo) return;

    this.loadingPhoto = true;
    this.photo.setValue(photo.dataUrl);
    this.loadingPhoto = false;
  }

  public saveWood(): void {
    this.saveWoodEvent.next(Date.now());
  }

  private saveWoodHandler(): void {
    this.sbs.push(
      this.saveWoodEvent
        .asObservable()
        .pipe(
          skipWhile((v) => v === null),
          switchMap((_) => this.reportService.activeWood.pipe(take(1))),
          tap({
            next: async (activeWood) => {
              try {
                await this.modalLoading.present();

                // Check if active wood is null.
                const wood = activeWood
                  ? activeWood
                  : this.reportService.emptyWood;

                const patchData = {
                  ...wood,
                  especieDeclarada: this.especie.value,
                  /**
                   * @dev url is a base64 string for localstorage/state and a download url for firebase.
                   */
                  url: this.photo.value,
                };
                this.reportService.patchActiveWood(patchData);

                // Run analysis.
                await this.reportService.analyzeWood();

                this.modalLoading.dismiss();
                this.utilsSvc.routerLink(
                  "/tabs/analysis/analysis-result-content"
                );
                this.resetForm();
              } catch (e) {
                this.modalError.present();
                this.modalLoading.dismiss();
              }
            },
          })
        )
        .subscribe()
    );
  }

  async openEspecie() {
    const selected = await this.utilsSvc.presentModal({
      component: EspecieModalComponent,
      cssClass: "modal-especie",
    });
    if (selected) {
      this.especie.setValue(selected.especie.nombreCientifico);
    }
  }

  /**
   * Reset form fields.
   */
  private resetForm(): void {
    this.especie.reset();
    this.photo.reset();
  }

  /**
   * Initialize modals for this page, so they are ready to be used withoud delay.
   */
  private async createModals(): Promise<void> {
    this.modalLoading = await this.modalController.create({
      component: LoadingModalComponent,
      cssClass: "modal-especie",
      backdropDismiss: false,
    });

    this.modalError = await this.modalController.create({
      component: ErrorModalComponent,
      cssClass: "modal-especie",
    });
  }
}
