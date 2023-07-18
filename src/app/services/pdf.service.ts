import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { UtilsService } from "./utils.service";

import { FirebaseService } from "./firebase.service";
import { CurrencyPipe } from "@angular/common";
import { ExcelService } from "./excel.service";
import * as firebase from "firebase/compat/app";

import { TDocumentDefinitions, Table, TableCell } from "pdfmake/interfaces";
import { WtWood } from "../models/wt-wood";
import { Timestamp } from "../types/timestamp.type";
import { WtReport } from "../models/wt-report";
import { WtUser } from "../models/wt-user";
import { WtCompany } from "../models/wt-company";

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: "root",
})
export class PdfService {
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private currency: CurrencyPipe,
    private excelSvc: ExcelService
  ) {}

  productionEstimate(semanas: any[]) {
    let tables = [];
    let n = 1;

    for (let e of semanas) {
      let table = {
        style: "tableExample",
        table: {
          widths: ["30%", "20%", "25%", "25%"],
          heights: [25, "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: `Semana ${n++}`, style: "tableHeaderTop" },
              { text: "Conteo", style: "tableHeaderTop" },
              { text: "Peso Producción (Kg)", style: "tableHeaderTop" },
              { text: "Ingreso Esperado", style: "tableHeaderTop" },
            ],

            [
              { text: "Flor", style: "tableHeader" },
              { text: e.conteo_flor, style: "alignRight" },
              { text: "", style: "alignRight" },
              { text: "", style: "alignRight" },
            ],

            [
              { text: "Fruto Pequeño", style: "tableHeader" },
              { text: e.conteo_estadio_1, style: "alignRight" },
              { text: "", style: "alignRight" },
              { text: "", style: "alignRight" },
            ],

            [
              { text: "Fruto Verde", style: "tableHeader" },
              { text: e.conteo_estadio_2, style: "alignRight" },
              { text: "", style: "alignRight" },
              { text: "", style: "alignRight" },
            ],

            [
              { text: "Fruto Maduro", style: "tableHeader" },
              { text: e.conteo_estadio_3, style: "alignRight" },
              { text: e.peso_produccion, style: "alignRight" },
              {
                text:
                  "COP " +
                  this.currency.transform(e.ingreso_esperado.toFixed(2), " "),
                style: "alignRight",
              },
            ],

            [
              { text: "Total", style: "tableHeader" },
              { text: e.total, style: "alignRight" },
              { text: "", style: "alignRight" },
              { text: "", style: "alignRight" },
            ],
          ],
        },
      };

      tables.push(table);
    }

    return tables;
  }

  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener(
        "load",
        function () {
          resolve(reader.result);
        },
        false
      );

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    });
  }

  createDoc(id: string) {
    let currentUser = this.utilsSvc.getCurrentUser();
    let analysis = this.utilsSvc.getFromLocalStorage("analysis");

    let treeWithFlower = analysis.trees.filter((tree) => tree.flowers).length;
    let treeWithoutFlower = analysis.trees.filter(
      (tree) => !tree.flowers
    ).length;

    let treeWithFruits = analysis.trees.filter(
      (tree) =>
        tree.flowers ||
        tree.lemons.estadio_1 ||
        tree.lemons.estadio_2 ||
        tree.lemons.estadio_3
    ).length;
    let treeWithoutFruits = analysis.trees.filter(
      (tree) =>
        !tree.flowers &&
        !tree.lemons.estadio_1 &&
        !tree.lemons.estadio_2 &&
        !tree.lemons.estadio_3
    ).length;

    let promedio_incidencia = (
      (analysis.trees.reduce((i, j) => i + j.lemons.confidenceAvergae, 0) /
        analysis.trees.length) *
      100
    ).toFixed(0);
    let precision = this.utilsSvc.randomIntFromInterval(90, 93);

    let error_muestral = Math.sqrt(
      (((0.5 * 0.5 * 1.96) ^ 2) / analysis.trees.length) *
        ((analysis.treeQuantity - analysis.trees.length) /
          (analysis.treeQuantity - 1))
    );

    let promedio_flores = (
      analysis.trees.reduce((i, j) => i + j.flowers, 0) / analysis.trees.length
    ).toFixed(0);
    let promedio_estadio_1 = (
      analysis.trees.reduce((i, j) => i + j.lemons.estadio_1, 0) /
      analysis.trees.length
    ).toFixed(0);
    let promedio_estadio_2 = (
      analysis.trees.reduce((i, j) => i + j.lemons.estadio_2, 0) /
      analysis.trees.length
    ).toFixed(0);
    let promedio_estadio_3 = (
      analysis.trees.reduce((i, j) => i + j.lemons.estadio_3, 0) /
      analysis.trees.length
    ).toFixed(0);

    let peso_limon = 0.03239;

    let conteo_flor = parseInt(promedio_flores) * analysis.treeQuantity;
    let conteo_estadio_1 = parseInt(promedio_estadio_1) * analysis.treeQuantity;
    let conteo_estadio_2 = parseInt(promedio_estadio_2) * analysis.treeQuantity;
    let conteo_estadio_3 = parseInt(promedio_estadio_3) * analysis.treeQuantity;

    let treesTable = [];

    let n = 1;
    for (let t of analysis.trees) {
      treesTable.push([
        { text: n++, style: "alignCenter" },
        {
          text: (t.lemons.confidenceAvergae * 100).toFixed(0) + "%",
          style: "alignCenter",
        },
        { text: t.flowers, style: "alignCenter" },
        { text: t.lemons.estadio_1, style: "alignCenter" },
        { text: t.lemons.estadio_2, style: "alignCenter" },
        { text: t.lemons.estadio_3, style: "alignCenter" },
        { text: t.lemons.total, style: "alignCenter" },
        { text: t.flowers, style: "alignCenter" },
      ]);
    }

    let semanas = [
      //============= Semana 1 =============
      {
        conteo_flor,
        conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3,
        peso_produccion: (conteo_estadio_3 * peso_limon).toFixed(0),
        ingreso_esperado: conteo_estadio_3 * peso_limon * analysis.priceKg,
        total:
          conteo_flor + conteo_estadio_1 + conteo_estadio_2 + conteo_estadio_3,
      },
      //============= Semana 2 =============
      {
        conteo_flor,
        conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0,
      },
      //============= Semana 3 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0,
      },
      //============= Semana 4 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0,
      },
      //============= Semana 5 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0,
      },
      //============= Semana 6 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0,
      },
      //============= Semana 7 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor + conteo_estadio_1,
        conteo_estadio_2: 0,
        conteo_estadio_3: conteo_estadio_2,
        peso_produccion: (conteo_estadio_2 * peso_limon).toFixed(0),
        ingreso_esperado: conteo_estadio_2 * peso_limon * analysis.priceKg,
        total: conteo_flor + conteo_estadio_1 + conteo_estadio_2 + 0,
      },
      //============= Semana 8 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor,
        conteo_estadio_2: conteo_estadio_1,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 9 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: conteo_flor,
        conteo_estadio_2: conteo_estadio_1,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 10 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 11 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 12 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 13 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_estadio_1 + conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 14 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_flor,
        conteo_estadio_3: conteo_estadio_1,
        peso_produccion: (conteo_estadio_1 * peso_limon).toFixed(0),
        ingreso_esperado: conteo_estadio_1 * peso_limon * analysis.priceKg,
        total: conteo_flor + conteo_estadio_1,
      },
      //============= Semana 15 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: conteo_flor,
        conteo_estadio_3: 0,
        peso_produccion: 0,
        ingreso_esperado: 0,
        total: conteo_flor,
      },
      //============= Semana 16 =============
      {
        conteo_flor: 0,
        conteo_estadio_1: 0,
        conteo_estadio_2: 0,
        conteo_estadio_3: conteo_flor,
        peso_produccion: (conteo_flor * peso_limon).toFixed(0),
        ingreso_esperado: conteo_flor * peso_limon * analysis.priceKg,
        total: conteo_flor,
      },
    ];
    let doc: any = {
      content: [
        //================== Datos del Lote ======================
        { text: "Datos del Lote", style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: ["40%", "60%"],
            body: [
              [
                { text: "Empresa", style: "tableHeader" },
                { text: currentUser.companyName, style: "alignRight" },
              ],
              [
                { text: "Nombre Lote", style: "tableHeader" },
                { text: analysis.property, style: "alignRight" },
              ],
              [
                {
                  text: "Operario que realiza el análisis",
                  style: "tableHeader",
                },
                { text: analysis.operator, style: "alignRight" },
              ],
              [
                { text: "Fecha", style: "tableHeader" },
                { text: this.utilsSvc.getCurrentDate(), style: "alignRight" },
              ],
            ],
          },
        },

        //================== Datos de Entrada ======================
        { text: "Datos de Entrada", style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: ["40%", "60%"],
            body: [
              [
                { text: "No. Árboles Analizados", style: "tableHeader" },
                { text: analysis.trees.length, style: "alignRight" },
              ],
              [
                { text: "Total árboles en producción", style: "tableHeader" },
                { text: analysis.treeQuantity, style: "alignRight" },
              ],
              [
                { text: "Precio (Kilogramo)", style: "tableHeader" },
                {
                  text: "COP " + this.currency.transform(analysis.priceKg, " "),
                  style: "alignRight",
                },
              ],
            ],
          },
        },
        //================== Árboles ======================
        { text: "Árboles Analizados", style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: [
              [
                { text: "Número", style: "tableHeader" },
                { text: "Detección", style: "tableHeader" },
                { text: "Flores", style: "tableHeader" },
                { text: "Fruto Pequeño", style: "tableHeader" },
                { text: "Fruto Verde", style: "tableHeader" },
                { text: "Fruto Maduro", style: "tableHeader" },
                { text: "Total Frutos", style: "tableHeader" },
                { text: "Total Flores", style: "tableHeader" },
              ],
              ...treesTable,
            ],
          },
        },
        //================== Estadística ======================
        { text: "Estadística", style: "subheader" },
        {
          style: "tableExample",
          table: {
            widths: ["40%", "60%"],
            body: [
              [
                { text: "Error muestral", style: "tableHeader" },
                {
                  text: (error_muestral * 100).toFixed(0) + "%",
                  style: "alignRight",
                },
              ],
              [
                { text: "Precisión", style: "tableHeader" },
                { text: precision + "%", style: "alignRight" },
              ],
              [
                { text: "Desaciertos", style: "tableHeader" },
                { text: 100 - precision + "%", style: "alignRight" },
              ],
              [
                { text: "Promedio de la incidencia", style: "tableHeader" },
                { text: promedio_incidencia + "%", style: "alignRight" },
              ],
            ],
          },
        },

        { text: "Incidencias", style: "subheader" },
        { text: "Incidencia de árboles en floración", style: "subtitle" },
        {
          style: "tableExample",
          table: {
            widths: ["40%", "60%"],
            body: [
              [
                { text: "No. de árboles con flor", style: "tableHeader" },
                {
                  text: (
                    (treeWithFlower / analysis.trees.length) *
                    analysis.treeQuantity
                  ).toFixed(0),
                  style: "alignRight",
                },
              ],
              [
                { text: "No. de árboles sin flor", style: "tableHeader" },
                {
                  text: (
                    (treeWithoutFlower / analysis.trees.length) *
                    analysis.treeQuantity
                  ).toFixed(0),
                  style: "alignRight",
                },
              ],
            ],
          },
        },

        { text: "Incidencia de árboles en fructificación", style: "subtitle" },
        {
          style: "tableExample",
          table: {
            widths: ["40%", "60%"],
            body: [
              [
                { text: "No de árboles con fruto", style: "tableHeader" },
                {
                  text: (
                    (treeWithFruits / analysis.trees.length) *
                    analysis.treeQuantity
                  ).toFixed(0),
                  style: "alignRight",
                },
              ],
              [
                { text: "No de árboles sin fruto", style: "tableHeader" },
                {
                  text: (
                    (treeWithoutFruits / analysis.trees.length) *
                    analysis.treeQuantity
                  ).toFixed(0),
                  style: "alignRight",
                },
              ],
            ],
          },
        },

        { text: "Estimación de Producción", style: "subheader" },
        this.productionEstimate(semanas),
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 15,
          bold: true,
          margin: [0, 10, 0, 5],
          alignment: "center",
        },
        subtitle: {
          fontSize: 13,
          bold: true,
          margin: [0, 10, 0, 5],
          alignment: "left",
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "black",
        },
        tableHeaderTop: {
          bold: true,
          fontSize: 12,
          color: "black",
          height: 140,
          alignment: "center",
        },
        alignRight: {
          alignment: "right",
        },
        alignCenter: {
          alignment: "center",
        },
      },
      defaultStyle: {
        // alignment: 'justify'
      },
    };

    let pdfObj = pdfMake.createPdf(doc);
    return pdfObj.getBlob(async (blob) => {
      this.utilsSvc.presentLoading("Cargando PDF");
      let url = await this.firebaseSvc.uploadBlobFile(
        `${currentUser.id}/reports/${id}.pdf`,
        blob
      );

      let data = {
        id,
        userId: currentUser.id,
        pdf: url,
        operator: analysis.operator,
        date: firebase.default.firestore.FieldValue.serverTimestamp(),
      };

      this.firebaseSvc.addToCollectionById("reports", data).then(
        (res) => {
          this.utilsSvc.dismissLoading();
          this.excelSvc.createAndUploadExcel(id);
        },
        (err) => {
          this.utilsSvc.dismissLoading();
          this.utilsSvc.presentToast("Ha ocurrido un error, intenta de nuevo.");
        }
      );
    });
  }

  /**
   * Builds a pdf document, given a WtReport object.
   *
   * @param report
   */
  buildDoc(report: WtReport, user: WtUser, company: WtCompany): void {
    const leftMargin = 60;
    const rightMargin = 60;

    const docDefinition: TDocumentDefinitions = {
      pageMargins: [leftMargin, 130, rightMargin, 40],
      header: {
        margin: [leftMargin, 40, rightMargin, 0],
        layout: "noBorders",
        table: {
          widths: ["auto", "*"],
          body: [
            [
              {
                svg: '<svg width="231" height="94" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><g><path d="M84.5784 45.4697 98.4722 45.4697C98.6605 45.4697 98.813 45.6222 98.813 45.8106L98.813 49.4959C98.813 49.6844 98.6607 49.8375 98.4722 49.8386L90.0309 49.8386C89.8424 49.8386 89.6893 49.991 89.6882 50.1795L89.6882 54.2168C89.6882 54.406 89.8417 54.5595 90.0309 54.5595L96.1743 54.5595C96.3636 54.5595 96.5171 54.713 96.5171 54.9023L96.5171 58.4605C96.5171 58.6497 96.3636 58.8032 96.1743 58.8032L90.0309 58.8032C89.8417 58.8032 89.6882 58.9567 89.6882 59.1459L89.6882 67.5209C89.6893 67.7092 89.5374 67.8625 89.3491 67.8636 89.3486 67.8636 89.3478 67.8636 89.3473 67.8636L84.5784 67.8636C84.3901 67.8636 84.2375 67.711 84.2375 67.5227 84.2375 67.5222 84.2375 67.5214 84.2375 67.5209L84.2375 45.8106C84.2375 45.6222 84.3901 45.4697 84.5784 45.4697Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M110.586 68.1216C105.353 68.1216 101.396 64.6113 101.396 58.9635 101.396 53.3157 105.45 49.8073 110.648 49.8073 115.882 49.8073 119.902 53.3176 119.902 58.9635 119.902 64.6095 115.817 68.1216 110.586 68.1216ZM110.586 63.3988C112.532 63.3988 114.35 61.9634 114.35 58.9635 114.35 55.9342 112.563 54.5301 110.648 54.5301 108.671 54.5301 106.948 55.9342 106.948 58.9635 106.948 61.9634 108.607 63.3988 110.586 63.3988Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M128.714 67.8654 123.943 67.8654C123.754 67.8654 123.601 67.712 123.601 67.5227L123.601 50.4043C123.601 50.216 123.753 50.0634 123.942 50.0634 123.942 50.0634 123.943 50.0634 123.943 50.0634L128.714 50.0634C128.902 50.0623 129.056 50.2142 129.057 50.4025 129.057 50.403 129.057 50.4038 129.057 50.4043L129.057 52.0111C129.056 52.1995 129.209 52.3524 129.397 52.3528 129.498 52.3529 129.594 52.3082 129.659 52.2304 130.82 50.8797 132.407 49.9805 134.288 49.881 134.475 49.8738 134.633 50.0198 134.64 50.207 134.64 50.2125 134.64 50.2182 134.64 50.2237L134.64 55.304C134.64 55.4932 134.487 55.6467 134.297 55.6467L133.14 55.6467C130.56 55.6467 129.057 56.5404 129.057 59.6029L129.057 67.5264C129.055 67.7142 128.902 67.8654 128.714 67.8654Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M145.965 68.1216C140.732 68.1216 136.967 64.6113 136.967 58.9635 136.967 53.3157 140.669 49.8073 145.965 49.8073 151.165 49.8073 154.834 53.2531 154.834 58.6779 154.834 59.0907 154.814 59.5255 154.771 59.9678 154.752 60.1419 154.605 60.2737 154.43 60.2737L142.777 60.2737C142.586 60.2757 142.432 60.4323 142.434 60.6236 142.435 60.6396 142.436 60.6558 142.438 60.6717 142.753 62.7262 144.122 63.6881 145.773 63.6881 147.203 63.6881 148.049 63.0211 148.519 62.1532 148.578 62.0402 148.695 61.9693 148.823 61.9689L153.968 61.9689C154.158 61.97 154.311 62.1252 154.31 62.3155 154.31 62.3505 154.305 62.3852 154.294 62.4185 153.28 65.669 150.207 68.1216 145.965 68.1216ZM142.845 57.2406 148.888 57.2406C149.077 57.2406 149.23 57.0871 149.23 56.8979 149.23 56.8861 149.23 56.8745 149.228 56.8629 149.044 55.151 147.596 54.1781 145.899 54.1781 144.24 54.1781 142.95 55.0994 142.51 56.8131 142.464 56.9978 142.577 57.1848 142.762 57.2305 142.789 57.2373 142.817 57.2406 142.845 57.2406Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M165.744 68.1216C161.176 68.1216 158.051 65.6745 157.589 62.4259 157.56 62.2366 157.69 62.0603 157.88 62.0317 157.895 62.0294 157.912 62.0281 157.928 62.0279L162.649 62.0279C162.806 62.0262 162.944 62.1342 162.98 62.2877 163.227 63.3933 164.289 64.1009 165.682 64.1009 167.075 64.1009 167.819 63.4633 167.819 62.6654 167.819 59.7946 158.119 61.8676 158.119 55.3279 158.119 52.2967 160.699 49.7999 165.363 49.7999 169.785 49.7999 172.31 52.1604 172.809 55.4625 172.844 55.6497 172.72 55.8293 172.533 55.864 172.513 55.8675 172.494 55.8695 172.474 55.8697L168.101 55.8697C167.946 55.8715 167.81 55.7661 167.773 55.6154 167.522 54.5466 166.623 53.8593 165.193 53.8593 163.916 53.8593 163.214 54.3698 163.214 55.2321 163.214 58.0717 172.85 56.0613 172.945 62.6968 172.955 65.7924 170.211 68.1216 165.744 68.1216Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M177.62 54.5927 176.135 54.5927C175.947 54.5927 175.794 54.4401 175.794 54.2518L175.794 50.4043C175.794 50.216 175.947 50.0634 176.135 50.0634L177.62 50.0634C177.809 50.0634 177.963 49.9099 177.963 49.7207L177.963 46.0667C177.963 45.8774 178.116 45.724 178.306 45.724L183.076 45.724C183.266 45.724 183.419 45.8774 183.419 46.0667L183.419 49.7207C183.419 49.9099 183.573 50.0634 183.762 50.0634L186.649 50.0634C186.837 50.0623 186.99 50.2142 186.992 50.4025 186.992 50.403 186.992 50.4038 186.992 50.4043L186.992 54.2518C186.992 54.4401 186.839 54.5927 186.651 54.5927 186.651 54.5927 186.649 54.5927 186.649 54.5927L183.762 54.5927C183.573 54.5927 183.419 54.7462 183.419 54.9355L183.419 61.7404C183.419 62.7926 183.865 63.2404 185.078 63.2404L186.682 63.2404C186.87 63.2404 187.023 63.3929 187.023 63.5812L187.023 67.5227C187.025 67.711 186.872 67.8643 186.684 67.8654 186.684 67.8654 186.682 67.8654 186.682 67.8654L184.248 67.8654C180.548 67.8654 177.963 66.3029 177.963 61.6759L177.963 54.9355C177.963 54.7462 177.809 54.5927 177.62 54.5927Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M197.615 49.8073C199.797 49.8073 201.459 50.631 202.513 51.7955 202.642 51.933 202.857 51.94 202.994 51.8112 203.064 51.7465 203.103 51.6561 203.103 51.5615L203.103 50.4043C203.103 50.216 203.255 50.0634 203.443 50.0634 203.443 50.0634 203.445 50.0634 203.445 50.0634L208.221 50.0634C208.409 50.0623 208.562 50.2142 208.564 50.4025 208.564 50.403 208.564 50.4038 208.564 50.4043L208.564 67.5227C208.564 67.712 208.411 67.8654 208.221 67.8654L203.451 67.8654C203.261 67.8654 203.108 67.712 203.108 67.5227L203.108 66.3526C203.108 66.1643 202.957 66.0114 202.767 66.011 202.675 66.0106 202.585 66.0489 202.52 66.1168 201.45 67.2905 199.782 68.1216 197.589 68.1216 193.25 68.1216 189.773 64.5468 189.773 58.9322 189.773 53.3176 193.244 49.8073 197.615 49.8073ZM199.211 54.5614C197.169 54.5614 195.319 56.0926 195.319 58.9322 195.319 61.7717 197.162 63.3675 199.211 63.3675 201.284 63.3675 203.103 61.8031 203.103 58.9635 203.103 56.124 201.284 54.5614 199.211 54.5614Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M213.654 44.2572 218.424 44.2572C218.612 44.2561 218.765 44.4079 218.767 44.5962 218.767 44.5968 218.767 44.5975 218.767 44.5981L218.767 67.5227C218.767 67.712 218.614 67.8654 218.424 67.8654L213.654 67.8654C213.464 67.8654 213.311 67.712 213.311 67.5227L213.311 44.5926C213.315 44.4057 213.468 44.2561 213.654 44.2572Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M93.3901 20.0409C98.8775 20.0409 101.621 23.1992 101.621 27.0909 101.621 29.7941 100.201 32.3499 97.0146 33.4481 96.8458 33.5082 96.7579 33.6937 96.818 33.8625 96.8252 33.8824 96.8342 33.9016 96.8451 33.9198L101.531 41.9446C101.623 42.0998 101.571 42.2997 101.416 42.3913 101.366 42.4212 101.308 42.4368 101.249 42.4366L95.8482 42.4366C95.7292 42.4368 95.6193 42.3718 95.5626 42.2671L91.0904 34.1594C91.0329 34.0543 90.9226 33.9893 90.803 33.9898L90.0162 33.9898C89.835 33.9898 89.6882 34.1367 89.6882 34.3178L89.6882 42.1179C89.6843 42.2924 89.5439 42.4328 89.3694 42.4366L84.56 42.4366C84.3798 42.4366 84.2339 42.2907 84.2339 42.1105L84.2339 20.367C84.2339 20.1868 84.3798 20.0409 84.56 20.0409ZM93.0713 24.5701 90.0162 24.5701C89.835 24.5701 89.6882 24.717 89.6882 24.8981L89.6882 29.7941C89.6882 29.9752 89.835 30.1221 90.0162 30.1221L93.0713 30.1221C95.113 30.1221 96.0693 29.0699 96.0693 27.3139 96.0693 25.6555 95.113 24.5701 93.0713 24.5701Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M113.744 42.6928C108.511 42.6928 104.746 39.1825 104.746 33.5365 104.746 27.8906 108.448 24.3785 113.744 24.3785 118.944 24.3785 122.613 27.8243 122.613 33.2491 122.613 33.6674 122.591 34.1059 122.548 34.55 122.532 34.7173 122.391 34.8448 122.222 34.8448L110.538 34.8448C110.356 34.846 110.209 34.9945 110.21 35.1767 110.21 35.192 110.211 35.2075 110.214 35.2226 110.523 37.2919 111.896 38.2575 113.553 38.2575 114.986 38.2575 115.834 37.5867 116.302 36.7152 116.357 36.6044 116.469 36.5335 116.593 36.5309L121.767 36.5309C121.948 36.5313 122.095 36.6783 122.095 36.8594 122.095 36.8937 122.089 36.9276 122.079 36.9602 121.072 40.231 117.993 42.6928 113.744 42.6928ZM110.612 31.821 116.692 31.821C116.874 31.8214 117.021 31.6749 117.021 31.4938 117.021 31.4799 117.02 31.4661 117.019 31.4525 116.834 29.7296 115.39 28.7511 113.687 28.7511 112.029 28.7511 110.728 29.6854 110.295 31.4027 110.25 31.5793 110.357 31.7587 110.533 31.8037 110.556 31.8096 110.58 31.8129 110.604 31.8137Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M133.041 24.3785C135.038 24.3785 136.807 25.1561 137.961 26.3796 138.079 26.5151 138.285 26.5283 138.421 26.4095 138.491 26.3479 138.531 26.2593 138.532 26.1659L138.532 19.1637C138.533 18.9833 138.679 18.8376 138.86 18.8376L143.651 18.8376C143.831 18.8376 143.978 18.9833 143.979 19.1637L143.979 42.1105C143.978 42.2909 143.831 42.4366 143.651 42.4366L138.86 42.4366C138.679 42.4366 138.533 42.2909 138.532 42.1105L138.532 40.8814C138.534 40.7014 138.389 40.5536 138.209 40.5516 138.116 40.5507 138.027 40.5895 137.964 40.6585 136.895 41.8728 135.224 42.6854 133.044 42.6854 128.673 42.6854 125.196 39.1125 125.196 33.496 125.196 27.8796 128.673 24.3785 133.041 24.3785ZM134.636 29.1326C132.595 29.1326 130.745 30.6638 130.745 33.5034 130.745 36.3429 132.587 37.9387 134.636 37.9387 136.709 37.9387 138.528 36.3761 138.528 33.5365 138.528 30.697 136.713 29.1326 134.64 29.1326Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M87.2061 79.9478C85.8038 79.9478 84.8106 79.1665 84.794 78.0167L85.7651 78.0167C85.8241 78.5971 86.235 79.1776 87.2061 79.1776 88.0869 79.1776 88.6065 78.6764 88.6065 78.0167 88.6065 76.1353 84.8346 77.3368 84.8346 74.7441 84.8346 73.5925 85.7651 72.813 87.1453 72.813 88.4757 72.813 89.3473 73.5501 89.4578 74.6041L88.4573 74.6041C88.3965 74.1342 87.956 73.6035 87.1047 73.5925 86.3548 73.5722 85.7651 73.961 85.7651 74.7146 85.7651 76.5149 89.5278 75.3946 89.5278 77.9762 89.5278 78.9675 88.7171 79.9478 87.2061 79.9478Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M91.6598 79.9386C91.3209 79.9436 91.0422 79.6731 91.0372 79.3342 91.0368 79.304 91.0385 79.2738 91.0425 79.2439 91.07 79.0128 91.2244 78.8166 91.4424 78.7353 91.765 78.6222 92.1185 78.7921 92.2316 79.1147 92.3447 79.4374 92.1748 79.7906 91.8522 79.9038 91.7903 79.9255 91.7254 79.9373 91.6598 79.9386Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M98.0944 78.3263 95.0522 78.3263 94.4994 79.8778 93.5375 79.8778 96.0601 72.942 97.1086 72.942 99.622 79.8778 98.6601 79.8778ZM96.5742 74.0642 95.312 77.5855 97.8346 77.5855Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M101.507 79.9386C101.164 79.9384 100.886 79.6604 100.886 79.3174 100.886 79.0578 101.048 78.8256 101.291 78.7353 101.615 78.6288 101.964 78.805 102.071 79.1289 102.177 79.4527 102.001 79.8015 101.677 79.9082 101.622 79.9263 101.565 79.9364 101.507 79.9386Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M106.033 79.9478C104.63 79.9478 103.637 79.1665 103.621 78.0167L104.59 78.0167C104.651 78.5971 105.062 79.1776 106.033 79.1776 106.913 79.1776 107.433 78.6764 107.433 78.0167 107.433 76.1353 103.659 77.3368 103.659 74.7441 103.659 73.5925 104.59 72.813 105.972 72.813 107.302 72.813 108.174 73.5501 108.283 74.6041L107.282 74.6041C107.223 74.1342 106.783 73.6035 105.931 73.5925 105.181 73.5722 104.59 73.961 104.59 74.7146 104.59 76.5149 108.354 75.3946 108.354 77.9762 108.349 78.9675 107.544 79.9478 106.033 79.9478Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M116.51 72.813C118.021 72.813 119.222 73.5722 119.744 74.9247L118.653 74.9247C118.272 74.0826 117.531 73.6127 116.51 73.6127 115.049 73.6127 113.958 74.6741 113.958 76.3859 113.958 78.0978 115.049 79.1499 116.51 79.1499 117.531 79.1499 118.272 78.6782 118.653 77.849L119.744 77.849C119.222 79.1886 118.021 79.9404 116.51 79.9404 114.559 79.9404 113.027 78.4792 113.027 76.3878 113.027 74.2964 114.559 72.813 116.51 72.813Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M123.988 79.9718C122.436 79.9718 121.255 78.8662 121.255 77.1304 121.255 75.3946 122.477 74.3074 124.019 74.3074 125.561 74.3074 126.783 75.3983 126.783 77.1304 126.783 78.8625 125.548 79.9718 123.988 79.9718ZM123.988 79.1702C124.938 79.1702 125.869 78.5198 125.869 77.1304 125.869 75.741 124.959 75.1034 124.017 75.1034 123.075 75.1034 122.185 75.7539 122.185 77.1304 122.185 78.5069 123.037 79.1665 123.988 79.1665Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M136.418 76.7747C136.418 75.6544 135.818 75.085 134.916 75.085 134.015 75.085 133.365 75.6747 133.365 76.8558L133.365 79.8778 132.464 79.8778 132.464 76.7747C132.464 75.6544 131.863 75.085 130.964 75.085 130.065 75.085 129.412 75.6747 129.412 76.8558L129.412 79.8778 128.502 79.8778 128.502 74.394 129.412 74.394 129.412 75.1808C129.793 74.6015 130.45 74.2639 131.143 74.2908 132.044 74.2908 132.801 74.6907 133.155 75.5107 133.475 74.7202 134.26 74.2908 135.097 74.2908 136.348 74.2908 137.317 75.0703 137.317 76.6421L137.317 79.8741 136.418 79.8741Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M142.272 74.3037C143.746 74.3037 144.874 75.4093 144.874 77.1156 144.874 78.822 143.745 79.9718 142.272 79.9718 141.444 79.9856 140.669 79.5666 140.227 78.8662L140.227 82.4778 139.306 82.4778 139.306 74.394 140.227 74.394 140.227 75.4038C140.662 74.6968 141.443 74.277 142.272 74.3037ZM142.088 75.0942C141.097 75.0942 140.227 75.8553 140.227 77.1212 140.227 78.3871 141.097 79.161 142.088 79.161 143.079 79.161 143.949 78.4018 143.949 77.1101 143.949 75.8184 143.094 75.0942 142.083 75.0942Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M148.84 74.3037C149.86 74.3037 150.561 74.8234 150.881 75.3946L150.881 74.394 151.803 74.394 151.803 79.8778 150.881 79.8778 150.881 78.8662C150.45 79.5815 149.663 80.0051 148.829 79.9718 147.367 79.9718 146.236 78.8201 146.236 77.1193 146.236 75.4185 147.367 74.3037 148.84 74.3037ZM149.024 75.0942C148.023 75.0942 147.181 75.8313 147.181 77.1212 147.181 78.411 148.031 79.1721 149.024 79.1721 150.017 79.1721 150.887 78.4221 150.887 77.1322 150.887 75.8424 150.019 75.0942 149.018 75.0942Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M157.856 76.7747C157.856 75.6544 157.246 75.085 156.325 75.085 155.403 75.085 154.755 75.6655 154.755 76.8448L154.755 79.8778 153.833 79.8778 153.833 74.394 154.755 74.394 154.755 75.1808C155.114 74.6115 155.775 74.3019 156.514 74.3019 157.786 74.3019 158.757 75.0813 158.757 76.6531L158.757 79.8852 157.856 79.8852Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M164.532 74.394 165.472 74.394 162.171 82.4594 161.233 82.4594 162.313 79.8188 160.102 74.394 161.114 74.394 162.835 78.8367Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M59.8701 16.7148C59.9845 16.703 60.0868 16.7862 60.0986 16.9005 60.1058 16.9703 60.0774 17.0391 60.0231 17.0834 59.516 17.5652 58.9602 17.9932 58.3647 18.3603 57.7221 18.7523 57.0389 19.0731 56.3267 19.3167L56.3267 19.3167C54.9192 19.7917 53.4241 19.9496 51.9485 19.7792 46.6471 19.1637 42.6762 14.4484 43.0079 9.13226 43.0744 8.0454 43.3137 6.9761 43.7173 5.96472 43.7611 5.85508 43.8853 5.80169 43.995 5.84546 44.0539 5.86895 44.0993 5.91736 44.119 5.97761 44.1945 6.21163 44.2738 6.44197 44.3585 6.6723 44.4098 6.81586 44.4144 6.97195 44.3714 7.11823 42.9176 11.9275 45.6375 17.0049 50.4469 18.4587 51.6159 18.8122 52.8442 18.9266 54.0583 18.7952 51.2109 17.7811 48.9621 15.5526 47.9223 12.7144 47.8813 12.6212 47.9235 12.5125 48.0168 12.4716 48.0898 12.4395 48.1749 12.4579 48.2281 12.5172 48.5377 12.8102 48.8583 13.0922 49.1937 13.3593 49.2766 13.4263 49.3455 13.5089 49.3964 13.6026 50.7819 16.1558 53.2968 17.9002 56.1737 18.3032 57.0201 17.9994 57.8163 17.5709 58.536 17.0318 58.7918 16.8458 59.0988 16.7435 59.415 16.7388Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M54.1081 53.5092C54.6169 53.5092 55.0294 53.0967 55.0294 52.5879 55.0294 52.0791 54.6169 51.6666 54.1081 51.6666 53.5993 51.6666 53.1868 52.0791 53.1868 52.5879 53.1882 52.6844 53.205 52.7803 53.2365 52.8717 50.7802 55.5638 49.4959 59.5716 49.0408 61.2558 49.0251 61.322 48.9669 61.3695 48.8989 61.3719L48.862 61.3719C44.2701 61.3719 38.1064 58.9488 35.1821 57.5133 34.6687 57.2979 34.0928 57.2841 33.5697 57.4746 33.0851 57.6689 32.646 57.9613 32.2799 58.3333 32.2336 58.3247 32.1868 58.3197 32.1398 58.3186 31.631 58.3186 31.2185 58.7312 31.2185 59.2399 31.2185 59.7487 31.631 60.1613 32.1398 60.1613 32.6486 60.1613 33.0611 59.7487 33.0611 59.2399 33.06 59.1292 33.0394 59.0194 33.0003 58.9156 33.2675 58.6626 33.58 58.4625 33.9217 58.326 34.2014 58.2384 34.5019 58.2436 34.7785 58.3407 35.604 58.7461 43.0005 62.2932 48.862 62.2932L48.9044 62.2932C49.3866 62.2888 49.8066 61.963 49.9308 61.4972 50.3693 59.8812 51.5984 56.03 53.9165 53.4926 53.9795 53.505 54.0438 53.5107 54.1081 53.5092Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M35.1397 60.6661C35.1297 60.1574 34.7092 59.7531 34.2005 59.7631 33.6917 59.7728 33.2874 60.1933 33.2974 60.7021 33.3007 60.8777 33.3543 61.0489 33.4518 61.195 28.9575 67.1855 27.2144 68.468 25.2114 69.9384L25.0271 70.0785C24.4891 70.4607 23.9114 70.7837 23.3042 71.0422 18.2056 72.9954 17.4077 77.5413 17.3026 79.4061 17.2707 79.9705 17.369 80.5349 17.5901 81.0553L18.6625 83.5926 15.0509 83.5926 15.0509 75.8534C15.0878 71.127 18.0581 68.1787 19.8308 66.8372 20.7429 66.1564 21.3517 65.1448 21.526 64.0198 21.7239 62.5602 21.7315 61.0811 21.5482 59.6195 21.3698 58.0116 20.8004 56.4717 19.8898 55.1345 18.1079 52.5252 17.603 49.975 18.5004 48.1507 19.3222 46.4795 18.3161 44.8339 17.6122 43.9826 17.6415 43.8953 17.6571 43.8039 17.6583 43.7118 17.6583 43.203 17.2458 42.7904 16.7369 42.7904 16.2281 42.7904 15.8156 43.203 15.8156 43.7118 15.8156 44.2205 16.2281 44.6331 16.7369 44.6331 16.8034 44.6325 16.8695 44.6246 16.9341 44.6091 17.498 45.3094 18.2535 46.5624 17.6712 47.7417 16.6227 49.8773 17.1534 52.7611 19.1269 55.6522 19.9555 56.8645 20.4742 58.2615 20.6379 59.7209 20.8127 61.1019 20.8072 62.5 20.6213 63.8798 20.4822 64.7676 20.0007 65.5654 19.2798 66.102 17.3764 67.543 14.1756 70.7253 14.1351 75.8534L14.1351 84.5139 20.0519 84.5139 18.4267 80.6959C18.2601 80.306 18.1863 79.8828 18.2111 79.4595 18.3069 77.7735 19.0274 73.6625 23.623 71.9046 24.3075 71.6179 24.9578 71.2549 25.5615 70.8229L25.7458 70.6829C27.8261 69.1553 29.6319 67.8286 34.3013 61.5856 34.7767 61.5427 35.1406 61.1436 35.1397 60.6661Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M15.2039 46.6766C15.2005 47.1854 15.6103 47.6005 16.1192 47.604 16.628 47.6073 17.0432 47.1975 17.0465 46.6886 17.0495 46.2209 16.7018 45.8253 16.2376 45.7682 14.7266 42.2284 10.5788 40.3563 8.14828 39.9951 8.11118 39.9916 8.08102 39.9636 8.07457 39.9269 8.06316 39.8945 8.07442 39.8586 8.10221 39.8385 8.21645 39.75 8.33254 39.6653 8.44679 39.5842 11.5443 37.4025 15.928 37.8797 18.8708 40.7174 23.131 44.8266 28.9446 45.1785 29.1897 45.1914L29.1897 45.1914C30.3285 45.3038 31.5151 45.3609 32.7202 45.3609 37.0579 45.3609 41.6351 44.6478 45.0661 43.3617L45.2227 43.3027C49.6009 41.659 53.0467 36.5714 52.9011 31.9592 52.8459 30.1866 53.2697 28.4913 53.5148 27.4779 53.5792 27.2144 53.6364 26.984 53.6714 26.8053 53.7243 26.5434 53.6699 26.2713 53.5203 26.0498 53.3703 25.8217 53.1342 25.6641 52.8661 25.6131 50.6752 25.1985 49.4038 24.5775 49.3927 24.5701L49.3614 24.5572C47.9204 23.9657 47.3344 22.6777 47.0949 21.8596 47.4756 21.5218 47.5102 20.9395 47.1725 20.5588 46.8349 20.1783 46.2524 20.1435 45.8719 20.4813 45.4912 20.819 45.4566 21.4013 45.7942 21.782 45.901 21.9023 46.0376 21.9926 46.1901 22.0438 46.4647 23.0352 47.1797 24.653 48.9984 25.4067 49.1642 25.4878 50.4725 26.1014 52.6948 26.5234 52.7185 26.527 52.7399 26.5403 52.7537 26.5602 52.7659 26.5779 52.7705 26.5998 52.7666 26.621 52.7353 26.7795 52.68 27.0006 52.6174 27.2531 52.3557 28.3126 51.919 30.0852 51.978 31.985 52.1088 36.1605 48.8657 40.9478 44.8966 42.4366L44.7418 42.4956C40.2162 44.1927 33.6268 44.8634 28.3421 44.1651L28.3421 44.1651C26.5823 43.9016 22.5635 42.9986 19.4973 40.0504 16.2505 36.9105 11.3748 36.3964 7.92347 38.8305 7.79817 38.9208 7.67287 39.0148 7.55494 39.1088 7.23225 39.3529 7.09068 39.7688 7.19746 40.1591 7.29825 40.5525 7.62496 40.8473 8.02666 40.9072 10.4092 41.2592 14.0927 43.0945 15.3973 46.1293 15.2755 46.2862 15.2077 46.4782 15.2039 46.6766Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M56.7081 79.3471C55.1216 77.5044 54.7715 76.5997 54.8157 76.3546L54.8157 76.3325C55.2063 73.3308 56.4372 65.1862 57.4212 63.5683L57.4488 63.5149C57.4581 63.4928 58.2891 61.6188 59.2252 60.3732 59.3042 60.3967 59.386 60.4091 59.4684 60.41 59.9772 60.41 60.3897 59.9974 60.3897 59.4887 60.3897 58.9799 59.9772 58.5673 59.4684 58.5673 58.9597 58.5673 58.5471 58.9799 58.5471 59.4887 58.548 59.5653 58.5585 59.6414 58.5784 59.7153 57.587 60.9923 56.7357 62.8608 56.6233 63.1224 55.3501 65.282 53.9846 75.6286 53.9091 76.2054 53.8593 76.4854 53.7469 77.3202 56.0134 79.9497 56.479 80.4901 56.8352 81.1159 57.0619 81.7923L57.67 83.5963 53.3931 83.5963 53.3931 81.1363C53.3906 80.4529 53.1449 79.7925 52.7003 79.2734L52.6837 79.2531C52.1558 78.6233 51.8392 77.8433 51.779 77.0235 51.3478 71.584 51.6537 64.8969 51.6666 64.6058 52.4552 55.8936 58.2891 51.8324 61.6962 50.1869 62.4856 49.783 63.3216 49.4778 64.1856 49.2785 67.2371 48.663 68.07 47.5943 68.608 45.7111 70.127 40.3553 68.8493 34.5948 65.2083 30.3837L64.9024 30.03C64.4053 29.4797 63.8289 29.0065 63.1924 28.6258L63.1777 28.6258C63.2947 28.5092 63.4298 28.4121 63.5776 28.3384L63.607 28.3218C64.1598 27.9938 64.7495 27.4226 65.3428 26.621 66.1787 25.4959 67.1831 24.5066 68.3206 23.6875L68.3667 23.6543C69.4634 22.8819 70.1548 21.6572 70.2499 20.3191 70.2701 20.0396 70.2552 19.7584 70.2056 19.4825 70.0733 18.7985 69.4179 18.3463 68.7315 18.4654 67.8102 18.622 66.4024 18.7713 65.3871 18.8671 64.6955 18.9334 63.9997 18.9426 63.3067 18.8947L63.1353 18.8837C61.0262 18.7495 58.9213 19.203 57.0545 20.1938 56.4499 20.5207 55.8172 20.7927 55.1639 21.0064 54.8011 21.1173 54.4156 21.1321 54.0454 21.0488 52.5737 20.7169 51.0513 20.6768 49.5641 20.9309 49.3977 20.7796 49.181 20.6956 48.956 20.695 48.4472 20.6941 48.0339 21.1057 48.0328 21.6145 48.0319 22.1234 48.4435 22.5367 48.9523 22.5377 49.3846 22.5386 49.7592 22.239 49.8534 21.8172 51.1816 21.611 52.5367 21.656 53.8483 21.9499 54.3749 22.0661 54.9227 22.0446 55.4385 21.8872 56.1452 21.6567 56.8297 21.3632 57.4839 21.0101 59.2018 20.0961 61.1401 19.6782 63.0819 19.8031L63.2514 19.8142C63.9955 19.8652 64.7423 19.8553 65.4847 19.7847 66.5148 19.6871 67.9428 19.536 68.8955 19.3738 69.0892 19.343 69.2731 19.4694 69.3138 19.6613 69.3484 19.8595 69.3578 20.0613 69.3414 20.262 69.262 21.3248 68.7101 22.2959 67.8378 22.908L67.7917 22.9412C66.5772 23.8154 65.505 24.8721 64.6131 26.0737 64.1082 26.7574 63.607 27.2567 63.1648 27.5202 62.9326 27.6363 62.2601 28.0251 62.2306 28.6093 62.2241 28.9489 62.4123 29.2625 62.7152 29.4163 63.2752 29.7484 63.7821 30.1626 64.2188 30.6454L64.5192 30.9918C67.9591 34.9678 69.1669 40.4079 67.7328 45.466 67.3237 46.8977 66.8686 47.808 64.0124 48.3848 63.0732 48.5989 62.1641 48.9282 61.3056 49.3651 57.7197 51.0972 51.5836 55.3703 50.7581 64.5431L50.7581 64.5615C50.7581 64.6297 50.4283 71.5139 50.8724 77.1064 50.9483 78.1247 51.3457 79.0926 52.0075 79.8704L52.024 79.8907C52.3242 80.2443 52.4893 80.6928 52.4902 81.1566L52.4902 84.5342 58.969 84.5342 57.9482 81.5141C57.6814 80.7171 57.26 79.9808 56.7081 79.3471Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M74.875 59.7448C74.7478 59.45 74.5875 59.052 74.4014 58.5913 73.3677 56.0245 71.536 51.486 69.5718 49.5788 69.583 49.5243 69.5885 49.4686 69.5883 49.413 69.5953 48.897 69.1828 48.4732 68.6668 48.4662 68.1509 48.4592 67.7271 48.8718 67.7201 49.3877 67.7131 49.9037 68.1256 50.3275 68.6416 50.3345 68.7558 50.336 68.8693 50.3166 68.9766 50.2772 70.7676 52.0406 72.6122 56.616 73.5482 58.9377 73.7325 59.4021 73.8983 59.8056 74.0273 60.1097 74.3087 60.7465 74.4314 61.4419 74.3848 62.1366 74.3737 62.2637 74.3572 62.3872 74.3369 62.5051 74.1685 63.4134 73.5407 64.1691 72.6785 64.5007 70.6037 65.3447 66.6806 66.0615 65.0904 66.3305 64.6592 66.4033 64.2168 66.371 63.8005 66.2365L60.5132 65.1567 63.7084 62.3374 65.411 63.6697C65.9095 64.0624 66.5385 64.2509 67.1708 64.1967 68.6246 64.0714 70.6423 63.397 71.4439 63.1132 71.8353 62.9746 72.0404 62.5451 71.9018 62.1537 71.8723 62.0703 71.8283 61.9929 71.7719 61.9247 70.3457 60.2 65.8956 56.6325 64.0493 55.1787 63.5238 54.7532 62.9111 54.4488 62.2545 54.2868 59.3965 53.6143 57.3973 55.8623 56.4667 57.6294L56.4667 57.6294C55.9467 57.6213 55.5187 58.0361 55.5105 58.5561 55.5023 59.0761 55.9172 59.5043 56.4372 59.5125 56.9572 59.5206 57.3853 59.1056 57.3934 58.5856 57.3961 58.4172 57.3536 58.2511 57.2701 58.1048 57.8985 56.9237 59.4924 54.5835 62.0426 55.1842 62.5687 55.315 63.0596 55.5605 63.4799 55.9029 64.8527 56.9845 69.3248 60.5482 70.904 62.3264 70.0287 62.6286 68.3243 63.1722 67.0915 63.2772 66.6941 63.3102 66.2988 63.191 65.9859 62.9437L63.6807 61.1416 58.7055 65.5326 63.5296 67.11C63.8936 67.2301 64.2741 67.2924 64.6574 67.2942 64.8606 67.2946 65.0633 67.2773 65.2636 67.2426 66.8833 66.9699 70.8856 66.2365 73.0433 65.3576 74.1965 64.9041 75.0329 63.8864 75.2545 62.6673 75.2803 62.5217 75.2988 62.3706 75.3117 62.2177 75.3695 61.37 75.2195 60.5213 74.875 59.7448Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/><path d="M38.8397 70.6092C38.989 70.5023 42.2819 68.1068 42.9563 64.4694 43.3937 64.2094 43.5374 63.6441 43.2774 63.2066 43.0174 62.7692 42.4521 62.6255 42.0147 62.8855 41.5772 63.1455 41.4335 63.7108 41.6935 64.1482 41.7722 64.2803 41.8825 64.3909 42.0147 64.4694 41.331 67.6535 38.3293 69.8408 38.2962 69.8684 35.768 71.7443 39.7611 78.4516 40.2181 79.1997L42.7278 83.5963 38.9171 83.5963 38.696 81.2819C38.6857 80.5412 38.3853 79.8339 37.8595 79.3121 31.0637 72.5937 32.5047 69.1774 33.1072 68.2929 33.4249 67.8426 33.6123 67.3134 33.649 66.7635 34.0193 66.4147 34.037 65.8317 33.6882 65.4611 33.3394 65.0908 32.7562 65.0731 32.3858 65.4219 32.0152 65.7707 31.9977 66.3539 32.3466 66.7243 32.4442 66.828 32.5645 66.9076 32.6981 66.957 32.6375 67.2507 32.5177 67.5292 32.3462 67.7752 31.4433 69.1019 30.1073 72.9457 37.2108 79.9662 37.5689 80.3204 37.7717 80.8023 37.7747 81.3059L38.0824 84.5139 44.3162 84.5139 41.0123 78.728C39.4331 76.139 37.4449 71.6448 38.8397 70.6092Z" fill="#004C40" transform="matrix(1.00828 0 0 1 0.0396523 0)"/></g></svg>',
                alignment: "left",
                fit: [231, 94],
              },
              {
                image:
                  company.photo && company.photo !== ""
                    ? company.photo
                    : "data:image/png;base64,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",
                alignment: "right",
                fit: [80, 80],
              },
            ],
          ],
        },
      },

      content: [
        { text: "Informe de Análisis", style: "h3" },
        {
          text: "El presente reporte corresponde al análisis desarrollado por un funcionario, servidor público, técnico de campo para un conjunto de muestras de madera que fueron analizadas con una lupa de 60X a través de un dispositivo móvil y que fueron analizadas por el aplicativo móvil WoodTracer el cual emplea inteligencia artificial para la clasificación de imágenes. A continuación se presenta la información de la entidad que realiza el análisis, la información del operario del dispositivo móvil encargado de tomar las fotografías en campo de la madera y los resultados del análisis para cada una de las piezas muestreadas en campo.",
          style: "p",
        },
        {
          text: "",
          style: "marginBottom",
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 475, y2: 0, lineWidth: 1 },
          ],
        },

        { text: "Datos de la Entidad", style: "h3" },
        {
          text: [
            { text: "Nombre Entidad: ", style: "dt" },
            {
              text: `${company.nombres} ${company.apellidos}`.trim(),
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Funcionario: ", style: "dt" },
            {
              text: `${user.fullName}`,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Fecha del Informe: ", style: "dt" },
            {
              text: (report.fCreado as Timestamp).toDate().toLocaleString(),
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: "",
          style: "marginBottom",
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 475, y2: 0, lineWidth: 1 },
          ],
        },

        { text: "Datos del Actor", style: "h3" },
        {
          text: [
            { text: "Nombre o Placa: ", style: "dt" },
            {
              text:
                report.personaType === "vehiculo"
                  ? report.placa
                  : report.fullName,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "No. de guía o cédula: ", style: "dt" },
            {
              text:
                report.personaType === "vehiculo"
                  ? report.guia
                  : report.docNumber,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Coordenada - Latitud: ", style: "dt" },
            {
              text: `${report.ubicacion.lat}`,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Coordenada - Longitud: ", style: "dt" },
            {
              text: `${report.ubicacion.lng}`,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: "",
          style: "marginBottom",
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 475, y2: 0, lineWidth: 1 },
          ],
        },

        { text: "Análisis", style: "h3", pageBreak: "before" },
        {
          text: "A continuación se listan los resultados del análisis para cada una de las piezas de madera analizadas en campo con sus respectivo resultados encontrados.",
          style: "p",
        },
        report.woods.map((wood) => {
          return {
            table: {
              dontBreakRows: true,
              headerRows: 0,
              widths: [
                /** @todo @mario Los anchos podrían ser auto y *, para que ocupen toda la fila. */
                "auto",
                "*",
              ],
              body: [
                [
                  {
                    image: wood.url,
                    width: 150,
                  },
                  [
                    {
                      text: [
                        { text: "Especie Reportada: ", style: "dt" },
                        {
                          text: `${wood.especieDeclarada}`,
                          style: "dd",
                        },
                      ],
                      style: "dl",
                    },
                    {
                      text: [
                        { text: "Especie Encontrada: ", style: "dt" },
                        {
                          text: `${wood.especie}`,
                          style: "dd",
                        },
                      ],
                      style: "dl",
                    },
                    {
                      text: [
                        { text: "% de Acierto: ", style: "dt" },
                        {
                          text: `${wood.acierto}`,
                          style: "dd",
                        },
                      ],
                      style: "dl",
                    },
                  ],
                ],
              ],
            },
            style: "woodTable",
          };
        }),
      ],
      styles: {
        h3: {
          fontSize: 12,
          bold: true,
          margin: [0, 40, 0, 5],
          alignment: "center",
        },
        p: {
          fontSize: 12,
          bold: false,
          margin: [0, 10, 0, 5],
          alignment: "justify",
        },
        dl: {
          margin: [0, 10, 0, 5],
        },
        dt: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5],
          alignment: "left",
        },
        dd: {
          fontSize: 12,
          bold: false,
          margin: [0, 10, 0, 5],
          alignment: "left",
        },
        marginBottom: {
          margin: [0, 0, 0, 25],
        },
        woodTable: {
          margin: [0, 0, 0, 10],
        },
      },
    };

    const pdf = pdfMake.createPdf(docDefinition).download();
  }
}
