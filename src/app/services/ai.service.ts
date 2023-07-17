import { Injectable } from "@angular/core";
import { AiRespose } from "../models/ai-response.model";
import { WtWood } from "../models/wt-wood";
import { Failure } from "../utils/failure.utils";

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
  constructor() {}

  /**
   * Ejecuta el análisis de un WtWood, a partir del "localPath" de la imagen y devuelve el WtWood con
   * los campos "especie" y "acierto" poblados.
   *
   * @param wood
   * @returns
   * @throws AiFailure.
   */
  async withLocalImage(wood: WtWood): Promise<WtWood> {
    /**
     * @todo @mario Eliminar Timeout. Esto solo sirve para simular que el análisis toma tiempo.
     */
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
