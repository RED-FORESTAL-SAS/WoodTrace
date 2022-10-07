import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FirebaseService } from './firebase.service';
import { UtilsService } from "src/app/services/utils.service";
import * as fs from 'file-saver';
@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  private _workbook!: Workbook;

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  createAndUploadExcel() {
    this._workbook = new Workbook();

    this._workbook.creator = 'FinkApp';

    this.createExcelTable();
    this._workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data]);

      // fs.saveAs(blob, 'frutos_report_1.xlsx');

      this.firebaseSvc.uploadBlobFile(`${this.utilsSvc.getCurrentUser().id}/report_1.xlsx`, blob)
    })
  }


  createExcelTable() {
    let reportValues = [{
      especie: 'Limon Común',
      acierto: '99.5%',
      cantidad: 46,
      fecha: this.utilsSvc.getCurrentDate(),
      operario: 'Luis Martinez',
      estadio_1: 39,
      estadio_2: 0,
      estadio_3: 5,
      estadio_4: 2,
    },
  ]
  
    const sheet = this._workbook.addWorksheet('frutos');
    sheet.getColumn('A').width = 25;
    sheet.getColumn('D').width = 25;
    sheet.getColumn('E').width = 25;

    //====== Título de la hoja ========
    const titleCell = sheet.getCell('E1');
    titleCell.value = 'Reporte 1';
    titleCell.style.font = { bold: true, size: 16 }

    // ====== Cabecera ========
    const headerRow = sheet.getRow(3);

    headerRow.values = [
      'Especie',
      'Acierto',
      'Cantidad de Fruto',
      'Fecha',
      'Operario',
      'Estadio 1',
      'Estadio 2',
      'Estadio 3',
      'Estadio 4',
    ];

    headerRow.font = { bold: true, size: 13 }


    reportValues.map((value, index)=> {
      let rowCounter = index + 4;
      let row = sheet.getRow(rowCounter);
      row.font = { bold: false, size: 13 };

      row.values = [
        value.especie,
        value.acierto,
        value.cantidad,
        value.fecha,
        value.operario,
        value.estadio_1,
        value.estadio_2,
        value.estadio_3,
        value.estadio_4,
      ]

    })

  }





}
