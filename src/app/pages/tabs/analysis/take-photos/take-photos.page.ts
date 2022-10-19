import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-take-photos',
  templateUrl: './take-photos.page.html',
  styleUrls: ['./take-photos.page.scss'],
})
export class TakePhotosPage implements OnInit {


  photos = [];
  sides = ['Izquierda', 'Derecha', 'Adelante', 'Atrás'];

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
  }


  async uploadPhoto(sideSelected: string) {

    await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    }).then(image => {
      this.sides = this.sides.filter(side => side !== sideSelected);
      this.photos.push({ side: sideSelected, img: image.dataUrl });

    }, err => {
      console.log(err);

    })

  }


  removePhoto(index: number, side) {
    this.photos.splice(index, 1);
    this.sides.push(side)
  }

  submit() {
    this.utilsSvc.routerLink('/tabs/analysis/analysis-resumen')
  }
}
