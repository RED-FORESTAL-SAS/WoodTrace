import { FieldValue } from "../types/field-value.type";
import { Timestamp } from "../types/timestamp.type";

/**
 * Describe una imagen de alta resolución tomada a una muestra de madera, que se almacena localmente
 * para luego ser enviada a una API (AI local o remota) que la analiza y devuelve la especie de madera
 * y el porcentaje de certeza con que se identificó.
 *
 * Para manejar los Wood, en el almacenamiento local se almacenan el Reporte identificado como
 * "wt_active_report". Este documento tiene el campo "woods" donde se almacenan los Wood una vez que
 * se han completado.
 *
 * Cada vez que se inicia un nuevo Wood, se crea en el almacenamiento local identificado con el
 * nombre "wt_active_wood". Cuando este se completa, se agregada al Reporte activo. Esto implica
 * que solo puede existir uno y solo un Wood activo a la vez.
 *
 * Cuando una Wood se completa, entonces el documento "wt_active_wood" se setea a null.
 */
export interface WtWood {
  /**
   * Contiene la fecha/hora en milisegundos en formato string, con el momento de la creación del
   * WtWood en el almacenamiento local. Permite identificar el objeto localmente.
   */
  localId: string;
  /**
   * Local path in local file system where image was saved. Image will only be saved if AI service
   * requires it. It will be deleted after AI service has processed it.
   */
  localPath: string;
  /** Path de Firestorage donde está almacenada la imagen. */
  path: string;
  /**
   * String with Wood picture. In Firestore is stored the download URL. In localstorage is
   * stored as/converted to a base64 data url.
   */
  url: string;
  /**
   * Nombre de la especie declarada por el transportador. Permite verificar que la especie declarada
   * sí coincida con la especie analizada con el algoritmo de AI.
   */
  especieDeclarada: string;
  /**
   * Nombre de la especie resultante del análisis con la AI. Si no se ha analizado, será un string
   * vacío.
   */
  especieResultante: string;
  /**
   * Codigo del tipo de madera que se identificó en la muestra, como resultado del análisis con la AI.
   * Si no se ha analizado, será un string vacío. Tras el análisis, será un string con un número
   * entero correspondiente al listado de especies de madera en especies.ts, que tiene que ser el
   * mismo que devuelve la AI.
   */
  especie: string;
  /**
   * Porcentaje de certeza con que se identificó el tipo de madera en la muestra, como resultado del
   * análisis con la AI. Si no se ha analizado, será null.
   */
  acierto: number | null;
  /** ID del "Usuario" de la app WoodTracer que tomó la muestra. */
  wtUserId: string;
  /** Fecha de creación de la muestra. */
  fCreado: Timestamp | FieldValue | null;
  /** Fecha de modificación de la muestra. */
  fModificado: Timestamp | FieldValue | null;
}

/**
 * Describe un WtWood con el formato apropiado para guardarlo en el localstorage.
 * Todos los campos quedan iguales, excepto los campos "begins" y "ends" que se convierten a un objeto
 * con el que se pueda reconstruir el Timestamp.
 */
export interface LocalStorageWtWood {
  localId: string;
  localPath: string;
  path: string;
  url: string;
  especieDeclarada: string;
  especieResultante: string;
  especie: string;
  acierto: number | null;
  wtUserId: string;
  fCreado: {
    seconds: number;
    nanoseconds: number;
  };
  fModificado: {
    seconds: number;
    nanoseconds: number;
  };
}

export const NEW_WT_WOOD: WtWood = {
  localId: "0",
  localPath: "",
  path: "",
  url: "",
  especieDeclarada: "",
  especieResultante: "",
  especie: "",
  acierto: null,
  wtUserId: "",
  fCreado: null,
  fModificado: null,
};
