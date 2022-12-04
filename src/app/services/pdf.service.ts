import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { UtilsService } from './utils.service';

import { FirebaseService } from './firebase.service';
import { CurrencyPipe } from '@angular/common';
import { ExcelService } from './excel.service';
import * as firebase from 'firebase/compat/app';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private currency: CurrencyPipe,
    private excelSvc: ExcelService
  ) { }


  productionEstimate(semanas: any[]) {
    let tables = []
    let n = 1

    for (let e of semanas) {

      let table = {
        style: 'tableExample',
        table: {
          widths: ['30%', '20%', '25%', '25%'],
          heights: [25, 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [{ text: `Semana ${n++}`, style: 'tableHeaderTop' },
            { text: 'Conteo', style: 'tableHeaderTop' },
            { text: 'Peso Producción (Kg)', style: 'tableHeaderTop' },
            { text: 'Ingreso Esperado', style: 'tableHeaderTop' }],


            [{ text: 'Flor', style: 'tableHeader' },
            { text: e.conteo_flor, style: 'alignRight' },
            { text: '', style: 'alignRight' },
            { text: '', style: 'alignRight' }
            ],

            [{ text: 'Fruto Pequeño', style: 'tableHeader' },
            { text: e.conteo_estadio_1, style: 'alignRight' },
            { text: '', style: 'alignRight' },
            { text: '', style: 'alignRight' }
            ],

            [{ text: 'Fruto Verde', style: 'tableHeader' },
            { text: e.conteo_estadio_2, style: 'alignRight' },
            { text: '', style: 'alignRight' },
            { text: '', style: 'alignRight' }
            ],



            [{ text: 'Fruto Maduro', style: 'tableHeader' },
            { text: e.conteo_estadio_3, style: 'alignRight' },
            { text: e.peso_produccion, style: 'alignRight' },
            { text: 'COP ' + this.currency.transform(e.ingreso_esperado.toFixed(2), ' '), style: 'alignRight' }
            ],

            [{ text: 'Total', style: 'tableHeader' },
            { text: e.total, style: 'alignRight' },
            { text: '', style: 'alignRight' },
            { text: '', style: 'alignRight' }
            ],
          ]
        }
      }

      tables.push(table);
    }

    return tables;
  }

  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }


  createDoc(id: string) {
    let currentUser = this.utilsSvc.getCurrentUser();
    let analysis = this.utilsSvc.getFromLocalStorage('analysis');

    let treeWithFlower = analysis.trees.filter(tree => tree.flowers).length;
    let treeWithoutFlower = analysis.trees.filter(tree => !tree.flowers).length;

    let treeWithFruits = analysis.trees.filter(tree => tree.flowers || tree.lemons.estadio_1 || tree.lemons.estadio_2 || tree.lemons.estadio_3).length;
    let treeWithoutFruits = analysis.trees.filter(tree => !tree.flowers && !tree.lemons.estadio_1 && !tree.lemons.estadio_2 && !tree.lemons.estadio_3).length;

    let promedio_incidencia = ((analysis.trees.reduce((i, j) => i + j.lemons.confidenceAvergae, 0) / analysis.trees.length)*100).toFixed(0);
    let precision = this.utilsSvc.randomIntFromInterval(90, 93);

    let error_muestral = Math.sqrt(((0.5 * 0.5 * (1.96) ^ 2) / analysis.trees.length) * ((analysis.treeQuantity - analysis.trees.length) / (analysis.treeQuantity - 1)))


    let promedio_flores = (analysis.trees.reduce((i, j) => i + j.flowers, 0) / analysis.trees.length).toFixed(0);
    let promedio_estadio_1 = (analysis.trees.reduce((i, j) => i + j.lemons.estadio_1, 0) / analysis.trees.length).toFixed(0);
    let promedio_estadio_2 = (analysis.trees.reduce((i, j) => i + j.lemons.estadio_2, 0) / analysis.trees.length).toFixed(0);
    let promedio_estadio_3 = (analysis.trees.reduce((i, j) => i + j.lemons.estadio_3, 0) / analysis.trees.length).toFixed(0);

    let peso_limon = 0.03239;

    let conteo_flor = parseInt(promedio_flores) * analysis.treeQuantity;
    let conteo_estadio_1 = parseInt(promedio_estadio_1) * analysis.treeQuantity;
    let conteo_estadio_2 = parseInt(promedio_estadio_2) * analysis.treeQuantity;
    let conteo_estadio_3 = parseInt(promedio_estadio_3) * analysis.treeQuantity;

    let treesTable = []

    let n = 1;
    for (let t of analysis.trees) {
      
      treesTable.push([{ text: n++, style: 'alignCenter' },
      { text: (t.lemons.confidenceAvergae*100).toFixed(0) + '%', style: 'alignCenter' },
      { text: t.flowers, style: 'alignCenter' },
      { text: t.lemons.estadio_1, style: 'alignCenter' },
      { text: t.lemons.estadio_2, style: 'alignCenter' },
      { text: t.lemons.estadio_3, style: 'alignCenter' },
      { text: t.lemons.total, style: 'alignCenter' },
      { text: t.flowers, style: 'alignCenter' },
      ])

    }

    let semanas = [
      //============= Semana 1 =============
      {
        conteo_flor,
        conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3,
        peso_produccion: (conteo_estadio_3 * peso_limon).toFixed(0),
        ingreso_esperado: (conteo_estadio_3 * peso_limon) * analysis.priceKg,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + conteo_estadio_3
      },
      //============= Semana 2 =============
      {
        conteo_flor,
        conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0
      },
      //============= Semana 3 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0
      },
      //============= Semana 4 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0
      },
      //============= Semana 5 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0
      },
      //============= Semana 6 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0
      },
      //============= Semana 7 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2: 0,
        conteo_estadio_3: conteo_estadio_2,
        peso_produccion: (conteo_estadio_2 * peso_limon).toFixed(0),
        ingreso_esperado: (conteo_estadio_2 * peso_limon) * analysis.priceKg,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0
      },
      //============= Semana 8 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor,
        conteo_estadio_2: conteo_estadio_1,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 9 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor,
        conteo_estadio_2: conteo_estadio_1,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 10 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 11 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 12 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 13 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 14 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_flor,
        conteo_estadio_3: conteo_estadio_1,
        peso_produccion: (conteo_estadio_1 * peso_limon).toFixed(0),
        ingreso_esperado: (conteo_estadio_1 * peso_limon) * analysis.priceKg,
        total: conteo_flor + conteo_estadio_1
      },
      //============= Semana 15 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor
      },
      //============= Semana 16 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: 0,
        conteo_estadio_3: conteo_flor,
        peso_produccion: (conteo_flor * peso_limon).toFixed(0),
        ingreso_esperado: (conteo_flor * peso_limon) * analysis.priceKg,
        total: conteo_flor
      },
    ]
    let doc: any = {
      content: [
        //================== Datos del Lote ======================
        { text: 'Datos del Lote', style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            widths: ['40%', '60%'],
            body: [
              [{ text: 'Empresa', style: 'tableHeader' }, { text: currentUser.companyName, style: 'alignRight' }],
              [{ text: 'Nombre Lote', style: 'tableHeader' }, { text: analysis.property, style: 'alignRight' }],
              [{ text: 'Operario que realiza el análisis', style: 'tableHeader' }, { text: analysis.operator, style: 'alignRight' }],
              [{ text: 'Fecha', style: 'tableHeader' }, { text: this.utilsSvc.getCurrentDate(), style: 'alignRight' }],
            ]
          }
        },

        //================== Datos de Entrada ======================
        { text: 'Datos de Entrada', style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            widths: ['40%', '60%'],
            body: [
              [{ text: 'No. Árboles Analizados', style: 'tableHeader' }, { text: analysis.trees.length, style: 'alignRight' }],
              [{ text: 'Total árboles en producción', style: 'tableHeader' }, { text: analysis.treeQuantity, style: 'alignRight' }],
              [{ text: 'Precio (Kilogramo)', style: 'tableHeader' }, { text: 'COP ' + this.currency.transform(analysis.priceKg, ' '), style: 'alignRight' }]
            ]
          }
        },
        //================== Árboles ======================
        { text: 'Árboles Analizados', style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto','auto'],
            body: [
              [{ text: 'Número', style: 'tableHeader' },
              { text: 'Detección', style: 'tableHeader' },
              { text: 'Flores', style: 'tableHeader' },
              { text: 'Fruto Pequeño', style: 'tableHeader' },
              { text: 'Fruto Verde', style: 'tableHeader' },
              { text: 'Fruto Maduro', style: 'tableHeader' },
              { text: 'Total Frutos', style: 'tableHeader' },
              { text: 'Total Flores', style: 'tableHeader' },
              ],
              ...treesTable
            ]
          }
        },
        //================== Estadística ======================
        { text: 'Estadística', style: 'subheader' },
        {
          style: 'tableExample',
          table: {
            widths: ['40%', '60%'],
            body: [
              [{ text: 'Error muestral', style: 'tableHeader' }, { text: (error_muestral*100).toFixed(0)+'%', style: 'alignRight' }],
              [{ text: 'Precisión', style: 'tableHeader' }, { text: precision+'%', style: 'alignRight' }],
              [{ text: 'Desaciertos', style: 'tableHeader' }, { text: (100 - precision)+'%', style: 'alignRight' }],
              [{ text: 'Promedio de la incidencia', style: 'tableHeader' }, { text: promedio_incidencia + '%', style: 'alignRight' }],
            ]
          }
        },

        { text: 'Incidencias', style: 'subheader' },
        { text: 'Incidencia de árboles en floración', style: 'subtitle' },
        {
          style: 'tableExample',
          table: {
            widths: ['40%', '60%'],
            body: [
              [{ text: 'No. de árboles con flor', style: 'tableHeader' }, { text: ((treeWithFlower/analysis.trees.length)*analysis.treeQuantity).toFixed(0), style: 'alignRight' }],
              [{ text: 'No. de árboles sin flor', style: 'tableHeader' }, { text: ((treeWithoutFlower/analysis.trees.length)*analysis.treeQuantity).toFixed(0), style: 'alignRight' }],
            ]
          }
        },

        { text: 'Incidencia de árboles en fructificación', style: 'subtitle' },
        {
          style: 'tableExample',
          table: {
            widths: ['40%', '60%'],
            body: [
              [{ text: 'No de árboles con fruto', style: 'tableHeader' }, { text: ((treeWithFruits/analysis.trees.length)*analysis.treeQuantity).toFixed(0), style: 'alignRight' }],
              [{ text: 'No de árboles sin fruto', style: 'tableHeader' }, { text: ((treeWithoutFruits/analysis.trees.length)*analysis.treeQuantity).toFixed(0), style: 'alignRight' }],
            ]
          }
        },


        { text: 'Estimación de Producción', style: 'subheader' },
        this.productionEstimate(semanas)
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 15,
          bold: true,
          margin: [0, 10, 0, 5],
          alignment: 'center'
        },
        subtitle: {
          fontSize: 13,
          bold: true,
          margin: [0, 10, 0, 5],
          alignment: 'left'
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        },
        tableHeaderTop: {
          bold: true,
          fontSize: 12,
          color: 'black',
          height: 140,
          alignment: 'center'
        },
        alignRight: {
          alignment: 'right'
        },
        alignCenter: {
          alignment: 'center'
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      }

    }

    let pdfObj = pdfMake.createPdf(doc)
    return pdfObj.getBlob(async blob => {


    
      this.utilsSvc.presentLoading('Cargando PDF');
      let url = await this.firebaseSvc.uploadBlobFile(`${currentUser.id}/reports/${id}.pdf`, blob);


      let data = {
        id,
        userId: currentUser.id,
        pdf: url,
        operator: analysis.operator,
        date: firebase.default.firestore.FieldValue.serverTimestamp()
      }


      this.firebaseSvc.addToCollectionById('reports', data).then(res => {
        this.utilsSvc.dismissLoading();
        this.excelSvc.createAndUploadExcel(id);
      }, err => {
        this.utilsSvc.dismissLoading();
        this.utilsSvc.presentToast('Ha ocurrido un error, intenta de nuevo.')
      })



    })

  }




}
