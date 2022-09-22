import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fink-alert',
  templateUrl: './fink-alert.component.html',
  styleUrls: ['./fink-alert.component.scss'],
})
export class FinkAlertComponent implements OnInit {

@Input() title: string;
@Input() message: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {}


  confirm(){
    this.modalController.dismiss({ confirm: true });
  }
}
