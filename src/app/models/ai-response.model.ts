/**
 * Describe la respuesta de la AI al analizar una imagen correspondiente a una pieza de Madera.
 *
 * @todo @diana Validar que esta sea la estructura definitiva.
 */
export interface AiRespose {
  /**
   * Nombre de la especie de la pieza de madera.
   */
  especie: string;
  /**
   * Porcentaje de acierto de la AI.
   */
  acierto: number;
}
