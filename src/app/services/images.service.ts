import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Urls } from '../models/urls.model';


@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private http: HttpClient) { }


  analyzeImages(data: Urls) {
    return this.http.post('http://35.203.31.144/v1/predict', data);
  }


  /**
   * It takes an image, cuts it up into 144 pieces, and returns an array of 144 base64 encoded images
   * @param {string} imageBase64 - The base64 string of the image you want to cut up.
   * @returns An array of base64 strings.
   */
  cut(imageBase64: string) {
    var image = new Image();
    let imagePieces = [];
    image.onload = cutImageUp;
    image.src = imageBase64;

    function cutImageUp() {

      let numColsToCut = 12;
      let numRowsToCut = 12;
      let widthOfOnePiece = image.width / 12;
      let heightOfOnePiece = image.height / 12;

      for (var x = 0; x < numColsToCut; ++x) {
        for (var y = 0; y < numRowsToCut; ++y) {
          var canvas = document.createElement('canvas');
          canvas.width = widthOfOnePiece;
          canvas.height = heightOfOnePiece;
          var context = canvas.getContext('2d');
          context.drawImage(image, x * widthOfOnePiece, y * heightOfOnePiece, widthOfOnePiece, heightOfOnePiece, 0, 0, canvas.width, canvas.height);
          imagePieces.push(canvas.toDataURL());
        }
      }
    }

    return imagePieces;
  }

}
