import { Component, OnDestroy, OnInit } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UtilsService } from "src/app/services/utils.service";
import { FormControl, Validators } from "@angular/forms";
import { ReportService } from "src/app/services/report.service";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map, skipWhile, switchMap, take, tap } from "rxjs/operators";
import { especie } from "src/assets/data/especies";
import { EspecieModalComponent } from "src/app/shared/components/especie-modal/especie-modal.component";
import { WtWood } from "src/app/models/wt-wood";

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

  /** Observable with active report or null. */
  public activeWood$: Observable<WtWood | null>;
  /** Observable with boolean indicating if there is an active report or not. */
  public hasActiveWood$: Observable<boolean>;

  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {
    this.activeWood$ = this.reportService.activeWood;
    this.hasActiveWood$ = this.reportService.activeWood.pipe(
      map((wood) => !!wood)
    );
    this.saveWoodHandler();
  }

  ngOnInit() {
    this.populateForm();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
    this.saveWoodEvent.complete();
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
    this.loadingPhoto = false;
  }

  /**
   * Funciona para cuando se toma una foto con la camara del dispositivo
   */
  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 70,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    this.loadingPhoto = true;
    this.photo.setValue(image.dataUrl);
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
              if (wood === null) {
                console.log("wood is null");
                this.reportService.patchActiveWood(
                  this.reportService.emptyWood
                );
              }
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
              await this.reportService.analyzeWood();
              this.utilsSvc.routerLink("/tabs/analysis/analysis-result");
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
}
