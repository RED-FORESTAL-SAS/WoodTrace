import { Injectable } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { ImageExtension } from "../types/image-extension.type";

/** Describes a Photo, selected from files or taken with a camera. */
export interface Photo {
  /** String with photo "data url". */
  dataUrl: string;
  /** Photo format. */
  format: ImageExtension;
}

/** Describes the configuration object form pickOrTakePhoto method. */
export interface PickOrTakePhotoConfig {
  /** Calidad de la imagen. */
  quality: number;
  /** Permitir editar la imagen. */
  allowEditing: boolean;
  /** Header para el prompt. */
  promptLabelHeader: string;
  promptLabelPhoto: string;
  promptLabelPicture: string;
}

/**
 * Repository to access Camera.
 */
@Injectable({
  providedIn: "root",
})
export class CameraService {
  /**
   * Access the device camera and returns a Photo object, or null if user aborts or cancels.
   *
   * @param promptLabelHeader
   * @param promptLabelPhoto
   * @param promptLabelPicture
   * @returns {Photo} or null.
   */
  public async pickOrTakePhoto(
    pickOrTakePhotoConfig: Partial<PickOrTakePhotoConfig>
  ): Promise<Photo | null> {
    const defaultConfig: PickOrTakePhotoConfig = {
      quality: 70,
      allowEditing: false,
      promptLabelHeader: "Tomaro seleccionar foto",
      promptLabelPhoto: "Selecciona una imagen",
      promptLabelPicture: "Toma una foto",
    };

    const config = { ...defaultConfig, ...pickOrTakePhotoConfig };

    const image = await Camera.getPhoto({
      quality: config.quality,
      allowEditing: config.allowEditing,
      resultType: CameraResultType.DataUrl,
      promptLabelHeader: config.promptLabelHeader,
      promptLabelPhoto: config.promptLabelPhoto,
      promptLabelPicture: config.promptLabelPicture,
      source: CameraSource.Prompt,
      promptLabelCancel: "Cancelar",
    })
      .then((image) => ({
        dataUrl: image.dataUrl,
        format: image.format as ImageExtension,
      }))
      .catch((e) => {
        // If user cancels or operation fails, return null.
        return null;
      });

    console.log(image);
    return image;
  }
}
