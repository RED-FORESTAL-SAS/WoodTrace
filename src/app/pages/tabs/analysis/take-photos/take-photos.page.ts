import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ImagesService } from 'src/app/services/images.service';
import { UtilsService } from 'src/app/services/utils.service';

interface Img {
  side: string,
  img: string,
  divided: string[]
}

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
    private utilsSvc: UtilsService,
    private imagesSvc: ImagesService
  ) { }

  ngOnInit() {
  }


 /**
  * It takes a string as a parameter, then it gets a photo from the camera, then it converts the photo
  * to base64, then it pushes the photo to an array
  * @param {string} sideSelected - string - The side of the image that was selected.
  */
  async uploadPhoto(sideSelected: string) {

    let base64Img: string;
    let data: Img;

    await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    }).then(image => {

      base64Img = 'data:image/png;base64,' + image.base64String;
      data = { side: sideSelected, img: base64Img, divided: this.imagesSvc.cut(base64Img) }
        
      this.sides = this.sides.filter(side => side !== sideSelected);
      this.photos.push(data);  
        
    }, err => {
      console.log(err);

    })

  }


 /**
  * It removes the photo at the given index from the photos array and adds the side of the photo to the
  * sides array
  * @param {number} index - the index of the photo to be removed
  * @param {string} side - string - this is the side of the photo that was removed.
  */
  removePhoto(index: number, side: string) {
    this.photos.splice(index, 1);
    this.sides.push(side)
  }

  submit() {
    this.utilsSvc.routerLink('/tabs/analysis/analysis-resumen')
  }
}
