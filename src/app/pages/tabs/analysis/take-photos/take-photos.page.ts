import { Component, OnDestroy, OnInit } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UtilsService } from "src/app/services/utils.service";
import * as tensor from "@tensorflow/tfjs";
import { User } from "src/app/models/user.model";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FormControl, Validators } from "@angular/forms";
import { WoodService } from "src/app/services/wood.service";
import { ReportService } from "src/app/services/report.service";
import { BehaviorSubject, Subscription } from "rxjs";
import { skipWhile, switchMap, take, tap } from "rxjs/operators";
import { especie } from "src/assets/data/especies";

interface Img {
  side: string;
  file: any;
}

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
    private reportService: ReportService
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
              this.especie.setValue(wood.especieDeclarada);
              this.photo.setValue(wood.path);
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
              const patchData = {
                ...wood,
                especieDeclarada: this.especie.value,
                path: this.photo.value,
                /**
                 * @todo falta llenar los campos localPath y url.
                 */
              };
              this.reportService.patchActiveWood(patchData);
              await this.reportService.analyzeWood();
              this.utilsSvc.routerLink("/tabs/analysis/analysis-result");
            },
          })
        )
        .subscribe()
    );
  }

  // ================= Guardar la imagen =====================

  // async saveImage(imgData: Img) {
  //   const savedFile = await Filesystem.writeFile({
  //     path: `${this.treeId}/${imgData.side}.jpg`,
  //     data: imgData.file,
  //     directory: Directory.Data,
  //   });
  // }

  // async saveTree() {
  //   await Filesystem.mkdir({
  //     path: this.treeId,
  //     directory: Directory.Data,
  //   });

  //   for (let p of this.photos) {
  //     this.saveImage(p);
  //   }

  //   let currentAnalysis = this.currentAnalysis();

  //   currentAnalysis.pendingTrees.push(this.treeId);

  //   this.utilsSvc.saveLocalStorage("analysis", currentAnalysis);
  //   this.photos = [];
  //   this.sides = ["Izquierda", "Derecha", "Adelante", "Atrás"];
  //   this.utilsSvc.routerLink("/tabs/analysis/analysis-trees/pending");
  // }

  /**
   * It removes the photo at the given index from the photos array and adds the side of the photo to the
   * sides array
   * @param {number} index - the index of the photo to be removed
   * @param {string} side - string - this is the side of the photo that was removed.
   */
  // removePhoto(index: number, side: string) {
  //   this.photos.splice(index, 1);
  //   this.sides.push(side);
  // }

  //====================== Modelo Offline ===========================
  // async loadModel() {
  //   this.model = await tensor.loadGraphModel(
  //     "assets/modeljsmobilenet/model.json"
  //   );
  // }

  // async onImageUploaded(image: any) {
  //   let passImg = new Image();
  //   passImg.src = "data:image/png;base64," + image.base64String;
  //   passImg.width = 100;
  //   passImg.height = 100;

  //   let tensorImg = tensor.browser.fromPixels(passImg, 3);
  //   tensorImg = tensorImg.cast("float32").div(255).expandDims();

  //   let result = await this.model.executeAsync(tensorImg);

  //   for (let r of result) {
  //     console.log(r.dataSync());
  //   }
  // }
}
