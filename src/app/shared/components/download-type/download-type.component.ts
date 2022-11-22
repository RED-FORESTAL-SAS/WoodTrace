import { Component, Input, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { PdfService } from 'src/app/services/pdf.service';
@Component({
  selector: 'app-download-type',
  templateUrl: './download-type.component.html',
  styleUrls: ['./download-type.component.scss'],
})
export class DownloadTypeComponent implements OnInit {

  @Input() report;

  constructor(private pdfSvc: PdfService) { }

  ngOnInit() { }


  async PDF() {
    await Browser.open({ url: this.report.pdf });
  }

 async Excel() {
    await Browser.open({ url: this.report.excel });
  }

}
