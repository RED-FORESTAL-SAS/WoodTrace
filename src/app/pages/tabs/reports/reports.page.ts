import { Component, OnInit } from '@angular/core';
import { ExcelService } from 'src/app/services/excel.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

date = Date.now();

  constructor(
    private excelSvc: ExcelService,
    private utilsSvc: UtilsService
    ) { }

  ngOnInit() {

  }

  downloadType(){
    this.utilsSvc.downloadReport();
  }

  downloadExcel(){   
    this.excelSvc.createAndUploadExcel()
  }


}
