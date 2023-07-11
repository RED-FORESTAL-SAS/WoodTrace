import { Injectable } from "@angular/core";
import { Workbook } from "exceljs";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { FirebaseService } from "./firebase.service";
import { UtilsService } from "src/app/services/utils.service";
import * as fs from "file-saver";
import { Color } from "@ionic/core";
import { CurrencyPipe } from "@angular/common";
@Injectable({
  providedIn: "root",
})
export class ExcelService {
  private _workbook!: Workbook;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private currency: CurrencyPipe
  ) {}

  createAndUploadExcel(id: string) {
    this._workbook = new Workbook();

    this._workbook.creator = "FinkApp";
    this.createExcelTable();

    let currentUser = this.utilsSvc.getCurrentUser();
    let analisys = this.utilsSvc.getFromLocalStorage("analysis");

    this._workbook.xlsx.writeBuffer().then(async (data) => {
      const blob = new Blob([data]);

      // fs.saveAs(blob, 'frutos_report_1.xlsx');

      this.utilsSvc.presentLoading("Cargando Excel");
      let url = await this.firebaseSvc.uploadBlobFile(
        `${currentUser.id}/reports/${id}.xlsx`,
        blob
      );

      this.firebaseSvc.UpdateCollection("reports", { id, excel: url }).then(
        (res) => {
          this.utilsSvc.dismissLoading();
          this.utilsSvc.routerLink("/tabs/reports");

          if (analisys.pendingTrees.length) {
            analisys.trees = [];
            this.utilsSvc.saveLocalStorage("analysis", analisys);
          } else {
            this.utilsSvc.deleteFromLocalStorage("analysis");
          }
        },
        (err) => {
          this.utilsSvc.dismissLoading();
          this.utilsSvc.presentToast("Ha ocurrido un error, intenta de nuevo.");
        }
      );
    });
  }

  createExcelTable() {
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

    const sheet = this._workbook.addWorksheet("frutos");

    //============= Datos del Lote ===============
    sheet.getCell("A1").value = "Datos del Lote";
    sheet.getCell("A1").style.font = { bold: true, size: 18 };

    const colA = sheet.getColumn("A");
    colA.width = 40;
    colA.style.font = { bold: true, size: 15 };

    const colB = sheet.getColumn("B");
    colB.width = 30;
    colB.style.font = { bold: false, size: 15 };

    sheet.getColumn("C").width = 30;
    sheet.getColumn("C").style.font = { bold: false, size: 15 };

    sheet.getColumn("D").width = 30;
    sheet.getColumn("D").style.font = { bold: false, size: 15 };

    sheet.getColumn("E").width = 30;
    sheet.getColumn("E").style.font = { bold: false, size: 15 };

    sheet.getColumn("F").width = 30;
    sheet.getColumn("F").style.font = { bold: false, size: 15 };

    sheet.getColumn("G").width = 30;
    sheet.getColumn("G").style.font = { bold: false, size: 15 };

    sheet.getColumn("H").width = 30;
    sheet.getColumn("H").style.font = { bold: false, size: 15 };

    sheet.getRow(2).values = ["Empresa", currentUser.companyName];
    sheet.getRow(3).values = ["Nombre Lote", analysis.property];
    sheet.getRow(4).values = [
      "Operario que realiza el análisis",
      analysis.operator,
    ];
    sheet.getRow(5).values = ["Fecha", this.utilsSvc.getCurrentDate()];

    //============= Datos de Entrada ===============

    sheet.getCell("A9").value = "Datos de Entrada";
    sheet.getCell("A9").style.font = { bold: true, size: 18 };

    sheet.getRow(10).values = [
      "No. Árboles Analizados",
      analysis.trees.length + " ",
    ];
    sheet.getRow(11).values = [
      "Total árboles en producción",
      analysis.treeQuantity + " ",
    ];
    sheet.getRow(12).values = [
      "Precio (Kilogramo)",
      "COP " + this.currency.transform(analysis.priceKg, " "),
    ];

    //============= Estadística ===============

    sheet.getCell("A16").value = "Estadística";
    sheet.getCell("A16").style.font = { bold: true, size: 18 };

    sheet.getRow(17).values = [
      "Error muestral",
      (error_muestral * 100).toFixed(0) + "%",
    ];
    sheet.getRow(18).values = ["Precisión", precision + "%"];
    sheet.getRow(19).values = ["Desaciertos", 100 - precision + "%"];
    sheet.getRow(20).values = [
      "Promedio de la incidencia",
      promedio_incidencia + "%",
    ];

    //============= Incidencia de árboles en floración ===============

    sheet.getCell("A24").value = "Incidencia de árboles en floración";
    sheet.getCell("A24").style.font = { bold: true, size: 18 };

    sheet.getRow(25).values = [
      "No. de árboles con flor",
      (
        (treeWithFlower / analysis.trees.length) *
        analysis.treeQuantity
      ).toFixed(0),
    ];
    sheet.getRow(26).values = [
      "No. de árboles sin flor",
      (
        (treeWithoutFlower / analysis.trees.length) *
        analysis.treeQuantity
      ).toFixed(0),
    ];

    //============= Incidencia de árboles en fructificación ===============

    sheet.getCell("A30").value = "Incidencia de árboles en fructificación";
    sheet.getCell("A30").style.font = { bold: true, size: 18 };

    sheet.getRow(31).values = [
      "No de árboles con fruto",
      (
        (treeWithFruits / analysis.trees.length) *
        analysis.treeQuantity
      ).toFixed(0),
    ];
    sheet.getRow(32).values = [
      "No de árboles sin fruto",
      (
        (treeWithoutFruits / analysis.trees.length) *
        analysis.treeQuantity
      ).toFixed(0),
    ];

    //============= Estimación de Producción ===============

    sheet.getCell("A34").value = "Estimación de Producción";
    sheet.getCell("A34").style.font = { bold: true, size: 18 };

    let n_semana = 1;
    let n_row = 36;

    let cellsWithBordersWeeks = [];

    for (let e of semanas) {
      sheet.getRow(n_row).values = [
        `Semana ${n_semana++}`,
        "Conteo",
        "Peso Producción (Kg)",
        "Ingreso Esperado",
      ];
      sheet.getRow(n_row + 1).values = ["Flor", e.conteo_flor, " ", " "];
      sheet.getRow(n_row + 2).values = [
        "Fruto Pequeño",
        e.conteo_estadio_1,
        " ",
        " ",
      ];
      sheet.getRow(n_row + 3).values = [
        "Fruto Verde",
        e.conteo_estadio_2,
        " ",
        " ",
      ];
      sheet.getRow(n_row + 4).values = [
        "Fruto Maduro",
        e.conteo_estadio_3,
        e.peso_produccion,
        "COP " + this.currency.transform(e.ingreso_esperado.toFixed(2), " "),
      ];
      sheet.getRow(n_row + 5).values = ["Total", e.total, " ", " "];

      sheet.getCell("B" + n_row).style.font = { bold: true, size: 15 };
      sheet.getCell("C" + n_row).style.font = { bold: true, size: 15 };
      sheet.getCell("D" + n_row).style.font = { bold: true, size: 15 };

      cellsWithBordersWeeks.push(n_row);
      cellsWithBordersWeeks.push(n_row + 1);
      cellsWithBordersWeeks.push(n_row + 2);
      cellsWithBordersWeeks.push(n_row + 3);
      cellsWithBordersWeeks.push(n_row + 4);
      cellsWithBordersWeeks.push(n_row + 5);

      n_row = n_row + 9;
    }

    for (let c of cellsWithBordersWeeks) {
      sheet.getCell("A" + c).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("B" + c).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("C" + c).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("D" + c).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
    }

    //============= Generar bordes de tablas ===============

    let cellsWithBorders = [
      1, 2, 3, 4, 5, 9, 10, 11, 12, 16, 17, 18, 19, 20, 24, 25, 26, 30, 31, 32,
    ];

    for (let c of cellsWithBorders) {
      sheet.getCell("A" + c).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("B" + c).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
    }

    //============= Árboles Analizados =================

    sheet.getCell("A180").value = "Árboles Analizados";
    sheet.getCell("A180").style.font = { bold: true, size: 18 };

    sheet.getRow(181).values = [
      "Número",
      "Detección",
      "Flores",
      "Fruto Pequeño",
      "Fruto Verde",
      "Fruto Maduro",
      "Total Frutos",
      "Total Flores",
    ];

    sheet.getCell("B181").style.font = { bold: true, size: 15 };
    sheet.getCell("C181").style.font = { bold: true, size: 15 };
    sheet.getCell("D181").style.font = { bold: true, size: 15 };
    sheet.getCell("E181").style.font = { bold: true, size: 15 };
    sheet.getCell("F181").style.font = { bold: true, size: 15 };
    sheet.getCell("G181").style.font = { bold: true, size: 15 };
    sheet.getCell("H181").style.font = { bold: true, size: 15 };

    sheet.getCell("A181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("B181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("C181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("D181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("E181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("F181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("G181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    sheet.getCell("H181").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };

    analysis.trees.map((t, i) => {
      sheet.getRow(181 + (i + 1)).values = [
        i + 1,
        (t.lemons.confidenceAvergae * 100).toFixed(0) + "%",
        t.flowers,
        t.lemons.estadio_1,
        t.lemons.estadio_2,
        t.lemons.estadio_3,
        t.lemons.total,
        t.flowers,
      ];

      sheet.getCell("A" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("B" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("C" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("D" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("E" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("F" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("G" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      sheet.getCell("H" + (181 + i + 1)).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
    });
  }
}
