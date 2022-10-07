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

  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService
  ) { }

  ngOnInit() {
  }


  async uploadPhoto() {

    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.photos.push(image.dataUrl);
  }


  removePhoto(index: number) {
    this.photos.splice(index, 1)
  }

  submit(){
  this.utilsSvc.routerLink('/tabs/analysis/analysis-resumen')
  }
}
