import { Injectable } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { ImageExtension } from "../types/image-extension.type";
import { Failure } from "../utils/failure.utils";

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
  source: CameraSource;
}

export class CameraPermissionsFailure extends Failure {}

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
   * @throws {CameraPermissionsFailure}
   */
  public async pickOrTakePhoto(
    pickOrTakePhotoConfig: Partial<PickOrTakePhotoConfig>
  ): Promise<Photo | null> {
    // Check permissions. If user denies, cancell operation.
    let permissionStatus = await Camera.checkPermissions();

    if (
      pickOrTakePhotoConfig.source === CameraSource.Prompt ||
      pickOrTakePhotoConfig.source === CameraSource.Camera
    ) {
      if (permissionStatus.camera !== "granted") {
        const cameraPermissionStatus = await Camera.requestPermissions({
          permissions: ["camera"],
        });

        if (cameraPermissionStatus.camera !== "granted") {
          throw new CameraPermissionsFailure(
            "No se han concedido permisos de cámara"
          );
        }
      }
    }

    /**
     * @bug Check https://github.com/ionic-team/capacitor-plugins/issues/1512
     * Check https://github.com/ionic-team/capacitor-plugins/issues?q=camera+photos
     */

    const defaultConfig: PickOrTakePhotoConfig = {
      quality: 70,
      allowEditing: false,
      promptLabelHeader: "Tomaro seleccionar foto",
      promptLabelPhoto: "Selecciona una imagen",
      promptLabelPicture: "Toma una foto",
      source: CameraSource.Prompt,
    };

    const config = { ...defaultConfig, ...pickOrTakePhotoConfig };

    const image = await Camera.getPhoto({
      quality: config.quality,
      allowEditing: config.allowEditing,
      resultType: CameraResultType.DataUrl,
      promptLabelHeader: config.promptLabelHeader,
      promptLabelPhoto: config.promptLabelPhoto,
      promptLabelPicture: config.promptLabelPicture,
      source: config.source,
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

    return image;
  }
}
