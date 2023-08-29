import { Injectable } from "@angular/core";
import { AiRespose } from "../models/ai-response.model";
import { WtWood } from "../models/wt-wood";
import { Failure } from "../utils/failure.utils";
import * as tf from "@tensorflow/tfjs";

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
  public model: tf.LayersModel; // tf.Model

  constructor() {
    this.loadModel();
  }

  /**
   * Loads model from local assets.
   */
  private async loadModel() {
    this.model = await tf.loadLayersModel("/assets/tf/model.json");
    console.log(this.model.summary());
  }

  /**
   * Ejecuta el análisis de un WtWood, a partir del "localPath" de la imagen y devuelve el WtWood con
   * los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   */
  async withLocalImage(wood: WtWood): Promise<WtWood> {
    // console.log("image");
    // console.log(image);

    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    // ctx.drawImage(image, 0, 0);

    // Load image in a new img element.
    const image = new Image();
    image.src = wood.url;

    // Build a 4d tensor with image and 3 channels.
    const imageTensor = tf.browser.fromPixels(image, 3);

    // Resize image to 50x50.
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [50, 50]);

    /**
     * @dev Binarización de imagenes para quitar el fondo negro.
     */

    // Cast tensor to float32.
    const castedTensor = tf.cast(resizedTensor, "float32");

    // Divide tensor by 255 to work with numbers from 0 - 255.
    const dividedTensor = castedTensor.div(tf.scalar(255.0));

    // Expand tensor in 1 dimension.
    const finalTensor = dividedTensor.expandDims();

    // const imageTensor4d = imageTensor.as4D(1, 50, 50, 1);

    // Predict.
    // const result = (
    //   this.model.predict(imageTensor4d) as tf.Tensor<tf.Rank>
    // ).dataSync();

    const result = (
      this.model.predict(finalTensor) as tf.Tensor<tf.Rank>
    ).data();

    console.log("result");
    console.log(result);

    //  0 Guazuma_ulmifolia
    //  1 Tectona_grandis
    //  2 Erythrina_sp
    //  3 Peltogyne_purpurea
    //  4 Cedrela_odorata
    //  5 Anacardium_excelsum
    //  6 Cordia_alliodora
    //  7 Couma_macrocarpa
    //  8 Eucalyptus_tereticornis
    //  9 Pinus_radiata
    //  10 Centrolobium_yavizanum
    //  11 Ocotea_bofo
    //  12 Albizia_guachapele
    //  13 Tabebuia_rosea
    //  14 Xylosmaz_benthamii
    //  15 Melicoccus_bijugatus
    //  16 Ficus_sp
    //  17 Pithecellobium_dulce
    //  18 Jacaranda_copaia
    //  19 Pinus_patula
    //  20 Gmelina_arborea
    //  21 Qualea_acuminata
    //  22 Clathrotropis_brunnea
    //  23 Ocotea_insularis
    //  24 Quercus_humboldtii
    //  25 Campnosperma_panamensis
    //  26 Mangifera_indica
    //  27 Cedrelinga_cateniformis
    //  28 Cariniana_pyriformis

    // const img = tf.browser.fromPixels(wood.url);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    /**
     * @todo @mario Aquí se debe consumir la API de la AI, con la imagen que está en wood.localPath.
     * Y capturar los errore y emitirlos en caso de falla.
     *
     * Además, poblar apropiadamente el Wood modificado.
     */
    return { ...wood, especie: "Eucalipto", acierto: 0.9 };
  }

  /**
   * Ejecuta el análisis de un WtWood, a partir de la "url" de la imagen y devuelve el WtWood con
   * los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   *
   * @todo @mario Tener en cuenta que en este caso, la imagen solamente está en el dispositivo y no
   * se ha subido al Storage. Por lo tanto no hay una URL útil que la AI pueda consumir. Si la
   * implementación es así, será necesario resolver la lógica para que se suba la imagen, así sea
   * temporalmente, y se analice.
   */
  async withRemoteImage(wood: WtWood): Promise<WtWood> {
    /**
     * @todo @mario Eliminar Timeout. Esto solo sirve para simular que el análisis toma tiempo.
     */
    await new Promise((resolve) => setTimeout(resolve, 500));

    /**
     * @todo @mario Aquí se debe consumir la API de la AI, con la imagen que está en wood.localPath.
     * Y capturar los errore y emitirlos en caso de falla.
     *
     * Además, poblar apropiadamente el Wood modificado.
     */
    return { ...wood, especie: "Eucalipto", acierto: 0.9 };
  }
}
