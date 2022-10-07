import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
@Component({
  selector: 'app-download-type',
  templateUrl: './download-type.component.html',
  styleUrls: ['./download-type.component.scss'],
})
export class DownloadTypeComponent implements OnInit {

  constructor() { }

  ngOnInit() { }


  async PDF() {
    await Browser.open({ url: 'https://firebasestorage.googleapis.com/v0/b/finkapp-des.appspot.com/o/4gfUcD18TuWzsF7kqTE8sFZIjoS2%2Freport_1.xlsx?alt=media&token=111f2d1e-599d-418a-be06-53d9744c9f1f' });
  }

 async Excel() {
    await Browser.open({ url: 'https://firebasestorage.googleapis.com/v0/b/finkapp-des.appspot.com/o/4gfUcD18TuWzsF7kqTE8sFZIjoS2%2Freport_1.xlsx?alt=media&token=111f2d1e-599d-418a-be06-53d9744c9f1f' });
  }

}
