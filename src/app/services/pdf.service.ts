import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { UtilsService } from './utils.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FirebaseService } from './firebase.service';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
  ) { }


  createDoc() {

    let doc: any = {
      content: [
        { text: 'Reporte 1', style: 'subheader' },
        'Reporte de arboles',
        {
          style: 'tableExample',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Especie', 'Acierto', 'Fecha', 'Operario', 'Estadio 1', 'Estadio 2', 'Estadio 3', 'Estadio 4', 'Total'],
              ['Limón Común', '99.5%', this.utilsSvc.getCurrentDate(), 'Pedro Perez', '39', '0', '5', '2', '46']
            ]
          }
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justify'
      }

    }

    let pdfObj = pdfMake.createPdf(doc)
    this.uploadPDF(pdfObj);

  }

  uploadPDF(pdfObj: pdfMake.TCreatedPdf) {  

      pdfObj.getBlob(blob =>{
        this.firebaseSvc.uploadBlobFile('reporte.pdf', blob)
      })

  }


  async writeFile(path: string, file) {
    let result = await Filesystem.writeFile({
      path,
      data: file,
      directory: Directory.Documents,
      recursive: true
    });
  };
}
