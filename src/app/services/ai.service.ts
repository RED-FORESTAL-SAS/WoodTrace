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
    // console.log("🔥 Modelo cargado:");
    // console.log(this.model.summary());
  }

  /**
   * Ejecuta el análisis de un WtWood, a partir del "localPath" de la imagen y devuelve el WtWood con
   * los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   *
   * @dev Si es necesario, para quitar el fondo negro de la imágenes puede usarse un proceso llamado
   * Binarización.
   * @dev Los "console.log" comentados en la función se dejan en caso en que sea necesario hacer un
   * test detallado del comportamiento del modelo.
   */
  async withLocalImage(wood: WtWood): Promise<WtWood> {
    // Load image in a new img element.
    const image = new Image();
    image.src = wood.url;
    // console.log("🔥 Imagen cargada.");
    // console.log(wood.url);

    // Build a 3d tensor with image 3 dimensions (width, heigth, color chanels).
    const imageTensor = tf.browser.fromPixels(image, 3);
    // console.log("🔥 Tensor con la imagen.");
    // console.log(imageTensor.toString());

    // Resize image to 50x50 (size used to train model).
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [50, 50]);
    // console.log("🔥 Tensor convertido a 50x50.");
    // console.log(resizedTensor.toString());

    // Cast tensor to float32.
    const castedTensor = tf.cast(resizedTensor, "float32");
    // console.log("🔥 Tensor convertido a float32.");
    // console.log(castedTensor.toString());

    // Divide tensor by 255 to work with smaller numbers (0 to 1).
    const dividedTensor = castedTensor.div(tf.scalar(255.0));
    // console.log("🔥 Tensor dividido por 255.0");
    // console.log(dividedTensor.toString());

    // Expand tensor in 1 dimension. Model can take a 4th dimension to analyze more than 1 image.
    const tensor = dividedTensor.expandDims();
    // console.log("🔥 Tensor final.");
    // console.log(tensor.toString());

    // Make prediction.
    const result = (await (
      this.model.predict(tensor) as tf.Tensor<tf.Rank>
    ).data()) as Float32Array;
    // console.log("🎯 Resultado predicción.");
    // console.log(result);

    // Extract matchValue and matchIndex.
    const matchValue = Math.max(...result);
    // console.log("🎯 Valor máximo.");
    // console.log(matchValue);

    const matchIndex = result.indexOf(matchValue);
    // console.log("🎯 Índice del valor máximo.");
    // console.log(matchIndex);

    const acierto = matchValue;
    const especieResultante = ESPECIES.find(
      (e) => e.codigo === matchIndex
    ).nombreCientifico;
    // console.log("🎯 Especie resultante.");
    // console.log(especieResultante);

    const woodResultante = {
      ...wood,
      especie: `${matchIndex}`,
      especieResultante,
      acierto,
    };
    // console.log("🎯 Wood resultante.");
    // console.log(woodResultante);

    return woodResultante;
  }

  /**
   * Ejecuta el análisis remoto de un WtWood, a partir de la "url" de la imagen y devuelve el WtWood
   * con los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   *
   * @dev No se implementa porque el análisis de la imagen se hace local. Se deja en caso de que
   * se requiera su implementación futura.
   */
  async withRemoteImage(wood: WtWood): Promise<WtWood> {
    throw new Error("Method not implemented.");
  }
}
