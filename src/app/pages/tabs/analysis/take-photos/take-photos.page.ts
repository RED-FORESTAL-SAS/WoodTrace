import { Component, OnInit } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { UtilsService } from "src/app/services/utils.service";
import * as tensor from "@tensorflow/tfjs";
import { User } from "src/app/models/user.model";
import { Filesystem, Directory } from "@capacitor/filesystem";

interface Img {
  side: string;
  file: any;
}

@Component({
  selector: "app-take-photos",
  templateUrl: "./take-photos.page.html",
  styleUrls: ["./take-photos.page.scss"],
})
export class TakePhotosPage implements OnInit {
  model;
  photos = [];
  sides = ["Izquierda", "Derecha", "Adelante", "Atrás"];

  treeId: string;

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {
    this.setTreeArrays();
  }

  ionViewWillEnter() {
    this.treeId = Date.now().toString();
  }

  currentUser(): User {
    return this.utilsSvc.getCurrentUser();
  }

  currentAnalysis() {
    return this.utilsSvc.getFromLocalStorage("analysis");
  }

  setTreeArrays() {
    let currentAnalysis = this.currentAnalysis();

    if (!currentAnalysis.pendingTrees) {
      currentAnalysis.pendingTrees = [];
    }

    if (!currentAnalysis.trees) {
      currentAnalysis.trees = [];
    }

    this.utilsSvc.saveLocalStorage("analysis", currentAnalysis);
  }

  /**
   * It takes a string as a parameter, then it gets a photo from the camera, then it converts the photo
   * to base64, then it pushes the photo to an array
   * @param {string} sideSelected - string - The side of the image that was selected.
   */
  async takePhoto(sideSelected: string) {
    let data: Img;

    await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      promptLabelHeader: "Imagenes",
      promptLabelPhoto: "Elegir Foto",
      promptLabelPicture: "Tomar Foto",
      source: CameraSource.Prompt,
    }).then(
      async (image) => {
        data = { side: sideSelected, file: image.dataUrl };

        this.sides = this.sides.filter((side) => side !== sideSelected);
        this.photos.push(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // ================= Guardar la imagen =====================

  async saveImage(imgData: Img) {
    const savedFile = await Filesystem.writeFile({
      path: `${this.treeId}/${imgData.side}.jpg`,
      data: imgData.file,
      directory: Directory.Data,
    });
  }

  async saveTree() {
    await Filesystem.mkdir({
      path: this.treeId,
      directory: Directory.Data,
    });

    for (let p of this.photos) {
      this.saveImage(p);
    }

    let currentAnalysis = this.currentAnalysis();

    currentAnalysis.pendingTrees.push(this.treeId);

    this.utilsSvc.saveLocalStorage("analysis", currentAnalysis);
    this.photos = [];
    this.sides = ["Izquierda", "Derecha", "Adelante", "Atrás"];
    this.utilsSvc.routerLink("/tabs/analysis/analysis-trees/pending");
  }

  /**
   * It removes the photo at the given index from the photos array and adds the side of the photo to the
   * sides array
   * @param {number} index - the index of the photo to be removed
   * @param {string} side - string - this is the side of the photo that was removed.
   */
  removePhoto(index: number, side: string) {
    this.photos.splice(index, 1);
    this.sides.push(side);
  }

  //====================== Modelo Offline ===========================
  async loadModel() {
    this.model = await tensor.loadGraphModel(
      "assets/modeljsmobilenet/model.json"
    );
  }

  async onImageUploaded(image: any) {
    let passImg = new Image();
    passImg.src = "data:image/png;base64," + image.base64String;
    passImg.width = 100;
    passImg.height = 100;

    let tensorImg = tensor.browser.fromPixels(passImg, 3);
    tensorImg = tensorImg.cast("float32").div(255).expandDims();

    let result = await this.model.executeAsync(tensorImg);

    for (let r of result) {
      console.log(r.dataSync());
    }
  }
}
