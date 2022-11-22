import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Urls } from 'src/app/models/urls.model';
import { ImagesService } from 'src/app/services/images.service';
import { ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf.service';
import { ExcelService } from 'src/app/services/excel.service';

@Component({
  selector: 'app-analysis-trees',
  templateUrl: './analysis-trees.page.html',
  styleUrls: ['./analysis-trees.page.scss'],
})
export class AnalysisTreesPage implements OnInit {

  segment: string;
  pendingTrees = [];

  loading: boolean;
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private imagesSvc: ImagesService,
    private actRoute: ActivatedRoute,
    private pdfSvc: PdfService
  ) {

    this.segment = this.actRoute.snapshot.paramMap.get('segment')
  }

  ngOnInit() {

  }




  ionViewWillEnter() {

    this.segment = this.actRoute.snapshot.paramMap.get('segment')

    if (this.analysisFormData().pendingTrees.length) {
      this.loadFiles();
    }

  }

  analysisFormData() {
    return this.utilsSvc.getFromLocalStorage('analysis');
  }


  //================= Generar reporte ===================

  async generateFiles() {

    let id = Date.now().toString();
    this.pdfSvc.createDoc(id);

  }


  //================== Rehacer Análisis =================

  confirmRedoAnalysis(index: number) {
    this.utilsSvc.presentAlertConfirm({
      header: '¿Estás seguro/a de rehacer el análisis?',
      message: 'Se eliminará este análisis y tendrás que tomar fotos del árbol nuevamente',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {

          }
        }, {
          text: 'Rehacer',
          handler: () => {
            this.redoAnalysis(index)
          }
        }
      ]
    })
  }

  redoAnalysis(index: number) {

    let analisys = this.analysisFormData();
    analisys.trees.splice(index, 1);

    this.utilsSvc.saveLocalStorage('analysis', analisys);
    this.utilsSvc.routerLink('tabs/analysis/take-photos');
  }




  /**
    * It takes the photos from the array, uploads them to Firebase Storage, and then uploads the URLs to model API
    */
  async uploadPhotosToFireStorage(tree: any) {

    let currentUser = this.utilsSvc.getCurrentUser();
    let urls = [];
    let n = 1; // Número de imagen cargando

    for (let p of tree.images) {
      this.utilsSvc.presentLoading(`Subiendo imagen ${n++}/4`);

      let url = await this.firebaseSvc.uploadPhoto(`${currentUser.id}/report-images/${tree.id}/${p.side}`, p.file)
      urls.push(url);

      this.utilsSvc.dismissLoading();
    }


    let data: Urls = {
      url_1: urls[0],
      url_2: urls[1],
      url_3: urls[2],
      url_4: urls[3],
    }

    // this.analysisRandom(tree.id);
    this.analyzeTree(tree.id, data)
  }

  /**
     * It takes an object with the urls of the images to be analyzed, and then it uploads them to the
     * server, and then it saves the response in the local storage
     * @param {Urls} urls - Urls
     */
  analyzeTree(treeId: string, urls: Urls) {

    let currentAnalysis = this.utilsSvc.getFromLocalStorage('analysis');

    this.utilsSvc.presentLoading(`Analizando Imagenes`);
    this.imagesSvc.analyzeImages(urls).subscribe((res: any) => {

      if (!currentAnalysis.trees) {
        currentAnalysis.trees = [];
      }

      currentAnalysis.trees.push(res.data);

      this.utilsSvc.saveLocalStorage('analysis', currentAnalysis);
      this.deletePendingTree(treeId)

      this.utilsSvc.routerLink('/tabs/analysis/analysis-resumen/' + (currentAnalysis.trees.length - 1));
      this.utilsSvc.dismissLoading();

    }, error => {
      console.log(error);

      this.utilsSvc.presentToast('Ha ocurrido un error, intent')
      this.utilsSvc.dismissLoading();
    })
  }




  // ================= Obtener archivos almacenados en una ruta =====================
  async loadFiles() {
    this.loading = true;
    for (let p of this.analysisFormData().pendingTrees) {

      await Filesystem.readdir({
        path: p,
        directory: Directory.Data
      })
        .then(
          (result) => {

            this.loading = false;
            this.loadFileData(p, result.files);
          },
          async (err) => {

            this.loading = false;
            this.loadFiles()


          }
        )
    }
  }

  // ================= Obtener la información de las imagenes =====================
  async loadFileData(path, fileNames: any[]) {

    this.loading = true;

    let tree = {
      id: path,
      images: []
    };

    this.pendingTrees = [];

    for (let f of fileNames) {
      const filePath = `${path}/${f.name}`;

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data
      });

      tree.images.push({
        side: f.name.replace('.jpg', ''),
        file: `data:image/jpg;base64,${readFile.data}`
      });

    }

    this.loading = false;
    this.pendingTrees.push(tree);

  }


  // ================= Eliminar imagenes del almacenamiento local =====================
  async deleteImages(treeId: string) {

    let sides = ['Izquierda.jpg', 'Derecha.jpg', 'Adelante.jpg', 'Atrás.jpg'];

    for (let s of sides) {
      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: `${treeId}/${s}`
      });
    }

    this.deleteImagesFromFireStorage(treeId);

    if (this.analysisFormData().pendingTrees.length) {
      this.loadFiles();
    }
  }

  // ================= Eliminar imagenes del almacenamiento de Firebase =====================
  async deleteImagesFromFireStorage(treeId: string) {
    let sides = ['Izquierda', 'Derecha', 'Adelante', 'Atrás'];
    let currentUser = this.utilsSvc.getCurrentUser();

    for (let s of sides) {
      let path = `${currentUser.id}/report-images/${treeId}/${s}`
      await this.firebaseSvc.deleteFromStorage(path)
    }
  }

  //=========Analisis generado aleatoriamente========
  analysisRandom(treeId?: string) {
    let currentAnalysis = this.utilsSvc.getFromLocalStorage('analysis');

    if (!currentAnalysis.trees) {
      currentAnalysis.trees = [];
    }

    let flowers = this.randomIntFromInterval(1, 15);
    let estadio_1 = this.randomIntFromInterval(1, 15);
    let estadio_2 = this.randomIntFromInterval(1, 15);
    let estadio_3 = this.randomIntFromInterval(1, 15);

    currentAnalysis.trees.push({
      id: currentAnalysis.trees.length + 1,
      flowers,
      lemons: {
        confidenceAvergae: this.randomIntFromInterval(1, 100),
        estadio_1,
        estadio_2,
        estadio_3,
        total: flowers + estadio_1 + estadio_2 + estadio_3
      }
    });


    this.utilsSvc.saveLocalStorage('analysis', currentAnalysis);
    this.deletePendingTree(treeId)

    this.utilsSvc.routerLink('/tabs/analysis/analysis-resumen/' + (currentAnalysis.trees.length - 1));
  }


  deletePendingTree(treeId: string) {
    let currentAnalysis = this.utilsSvc.getFromLocalStorage('analysis');

    currentAnalysis.pendingTrees = currentAnalysis.pendingTrees.filter(tree => tree !== treeId);

    this.pendingTrees = currentAnalysis.pendingTrees;

    this.utilsSvc.saveLocalStorage('analysis', currentAnalysis);
    this.deleteImages(treeId);
  }

  //============== Generar número aleatorio ===========
  randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}
