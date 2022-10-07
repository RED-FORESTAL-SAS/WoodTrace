import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-analysis-resumen',
  templateUrl: './analysis-resumen.page.html',
  styleUrls: ['./analysis-resumen.page.scss'],
})
export class AnalysisResumenPage implements OnInit {

date = Date.now();

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
  }

  submit(){
  this.utilsSvc.routerLink('/tabs/analysis/analysis-trees')
  }
}
