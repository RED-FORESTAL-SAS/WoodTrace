import { Component, OnDestroy, OnInit } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UtilsService } from "src/app/services/utils.service";
import { FormControl, Validators } from "@angular/forms";
import { ReportService } from "src/app/services/report.service";
import { BehaviorSubject, Subscription } from "rxjs";
import { skipWhile, switchMap, take, tap } from "rxjs/operators";
import { especie } from "src/assets/data/especies";
import { EspecieModalComponent } from "src/app/shared/components/especie-modal/especie-modal.component";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-take-photos",
  templateUrl: "./take-photos.page.html",
  styleUrls: ["./take-photos.page.scss"],
})
export class TakePhotosPage implements OnInit, OnDestroy {
  especie = new FormControl("", [Validators.required]);
  photo = new FormControl("");
  loadingPhoto: boolean;

  especies = especie;

  private sbs: Subscription[] = [];

  /** BehaviourSubject to deal with event "saveWood". */
  private saveWoodEvent = new BehaviorSubject<number>(null);

  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService,
    private modalController: ModalController
  ) {
    this.saveWoodHandler();
  }

  ngOnInit() {
    this.populateForm();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

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
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    this.loadingPhoto = true;

    this.photo.setValue(image.dataUrl);
    console.log(this.photo.value);
    this.loadingPhoto = false;
  }

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    this.loadingPhoto = true;
    this.photo.setValue(image.dataUrl);
    console.log(this.photo.value);
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
            next: async (wood) => {
              /** @todo preguntar si wood es nulo. Si es, traer un wood vacio. */
              console.log(wood);
              const patchData = {
                ...wood,
                especieDeclarada: this.especie.value,
                path: this.photo.value,
                /**
                 * @todo @Mario falta llenar los campos localPath y url.
                 */
              };
              console.log(patchData);
              this.reportService.patchActiveWood(patchData);
              // await this.reportService.analyzeWood();
              // this.utilsSvc.routerLink("/tabs/analysis/analysis-result");
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
      this.especie.setValue(selected.especie.nombreCienticifo);
    }
  }

  /**
   * @todo @diana Mover esta lógica donde deba ir.
   */
  async onAnalizarHandler() {
    const modalLoading = await this.modalController.create({
      component: EspecieModalComponent, // @todo @diana poner otro componente.
      cssClass: "modal-especie", // @todo @diana poner otra clase.
    });
    modalLoading.present();

    try {
      const result = await this.reportService.analyzeWood();
      modalLoading.dismiss();

      /**
       * @todo @diana Hacer lo que haya que hacer con el resultado.
       */
    } catch (e) {
      /**
       * @todo @diana Abrir el modal del error.
       */
      modalLoading.dismiss();
    }
  }
}
