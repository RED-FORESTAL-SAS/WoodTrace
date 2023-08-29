import { Injectable } from "@angular/core";
import { WtWood } from "../models/wt-wood";
import { Failure } from "../utils/failure.utils";
import * as tf from "@tensorflow/tfjs";
import { ESPECIES } from "src/assets/data/especies";

/**
 * Failure for Ai Domain.
 */
export class AiFailure extends Failure {}

/**
 * Clase que consume la API de la AI para el análisis de las maderas.
 *
 * @todo @mario Esta clase no es un Mock. Es la implementación real, que irá a consumir la API de la
 * AI, donde quiera que quede desplegada. Se asume que todos los métodos son asíncronos, partiendo
 * de que, incluso si funciona localmente, el análisis debería tomar un tiempo.
 */
@Injectable({
  providedIn: "root",
})
export class AiService {
  /**
   * Modelo de la AI, que se carga en el constructor.
   */
  public model: tf.LayersModel;

  constructor() {
    this.loadModel();
  }

  /**
   * Loads model from local assets.
   */
  private async loadModel() {
    this.model = await tf.loadLayersModel("/assets/tf/model.json");
  }

  /**
   * Ejecuta el análisis de un WtWood, a partir del "localPath" de la imagen y devuelve el WtWood con
   * los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   *
   * @dev Para quitar el fondo negro de la imágenes puede usarse un proceso llamado Binarización.
   */
  async withLocalImage(wood: WtWood): Promise<WtWood> {
    // Load image in a new img element.
    const image = new Image();
    image.src = wood.url;
    // Build a 3d tensor with image 3 dimensions (width, heigth, color chanels).
    const imageTensor = tf.browser.fromPixels(image, 3);
    // Resize image to 50x50 (size used to train model).
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [50, 50]);
    // Cast tensor to float32.
    const castedTensor = tf.cast(resizedTensor, "float32");
    // Divide tensor by 255 to work with smaller numbers (0 to 1).
    const dividedTensor = castedTensor.div(tf.scalar(255.0));
    // Expand tensor in 1 dimension. Model can take a 4th dimension to analyze more than 1 image.
    const tensor = dividedTensor.expandDims();

    // Make prediction.
    const result = (await (
      this.model.predict(tensor) as tf.Tensor<tf.Rank>
    ).data()) as Float32Array;

    // Extract matchValue and matchIndex.
    const matchValue = Math.max(...result);
    const matchIndex = result.indexOf(matchValue);
    const acierto = matchValue;
    const especieResultante = ESPECIES.find(
      (e) => e.codigo === matchIndex
    ).nombreCientifico;

    return { ...wood, especie: `${matchIndex}`, especieResultante, acierto };
  }

  /**
   * Ejecuta el análisis de un WtWood, a partir de la "url" de la imagen y devuelve el WtWood con
   * los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   */
  async withRemoteImage(wood: WtWood): Promise<WtWood> {
    /**
     * @dev No se implementa porque el análisis de la imagen se hace local.
     */
    throw new Error("Method not implemented.");
  }
}
