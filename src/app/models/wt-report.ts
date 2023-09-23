import { Timestamp } from "../types/timestamp.type";
import { FieldValue } from "../types/field-value.type";
import { LocalStorageWtWood, WtWood } from "./wt-wood";
import { PersonaType } from "src/assets/data/persona-types";

/**
 * Un Reporte corresponde a un vehículo que transporta madera y que ha sido detenido por una autoridad
 * ambiental local (CAR). En un reporte se incluye una colección de análisis que puede contener una o
 * más muestras de diferentes maderas, sean de la misma especie o de diferentes especies, con los
 * resultados de sus respectivos análisis.
 *
 * Para manejar los reportes, en el almacenamiento local se almacena una colección identificado como
 * "wt_reports", a la que se agregará cada Report terminado, en orden cronológico. Cuando el
 * dispositivo tenga conexión, se crearán los reportes "aún no creados" en Firestore y se sincronizará
 * el id del documento creado con el reporte local.
 *
 * Adicionalmente, la colección "wt_reports" purgará los reportes más antiguos (y sus fotos) del
 * almacenamiento local, para mantener el dispositivo con espacio libre.
 *
 * En el almacenamiento local también se guarda un el Reporte activo, identificado como "wt_active_report",
 * que contiene el reporte que se está editando en el momento o null, si no hay un reporte activo.
 * Todos los "Wood" que se creen, se agregarán a este reporte. Cuando el usuario "guarde" el reporte,
 * este se agregará a la colección "wt_reports" y se limpiarán los datos del "wt_active_report" (null).
 * Esto implica que puede existir uno y solo un reporte activo.
 *
 * La creación de reportes localmente y la sincronización posterior con Firestore parten de las
 * siguientes premisas:
 *
 * 1. Los reportes se crean en el dispositivo y se almacenan en el localstorage en "reports". Estos
 * se consideran los datos de origen.
 * 2. Cuando haya conexión, los reportes creados se sincronizan con Firestore, actualizándose el id
 * de cada reporte y quedando los datos identicos tanto en el localstorage como en Firestore.
 * 3. A partir de "n" reportes creados, el almacenamiento local purgará los reportes más antiguos,
 * siempre que ya se hayan sincronizado con Firestore. La idea es mantener una o dos páginas de reportes,
 * para que el usuario pueda consultarlos sin conexión.
 * 4. Un usuario no podrá consultar los reportes más antiguos sin conexión a internet. Tanto los reportes
 * como sus imágenes y archivos se tendrán que consumir directamente desde Firestore. Y estos archivos
 * no se descargarán, a menos que el usuario los descargue manualmente.
 *
 * Finalmente, los Reportes se guardarán en la colección wt_reportes de la base de datos de RedForestal.
 */
export interface WtReport {
  /**
   * ID del documento en Firestore. Cuando recién se crea el Reporte localmente, el id es '0'.
   * Cuando se sincroniza (se crea el documento en Firestore), el id se actualizará con el id asignado.
   */
  id: string;
  /**
   * Contiene la fecha/hora en milisegundos en formato string, con el momento de la creación del
   * reporte en el almacenamiento local. Permite identificar el reporte localmente.
   */
  localId: string;
  /** tipo de persona a la que se le hace análisis. Si es una persona o es un vehiculo*/
  personaType: PersonaType;
  /** Si personaType==='persona' nombre completo */
  fullName: string;
  /** Si personaType==='persona' tipo documento */
  docType: number;
  /** Si personaType==='persona' documento */
  docNumber: string;

  /** Número de la placa del vehículo que transporta la madera. */
  placa: string;
  /** Número de la guía que porta el transportador para la movilización de la madera. */
  guia: string;
  /** Departamento donde se ubica la carga a analizar en el reporte */
  departamento: string;
  /** Municipio donde se ubica la carga a analizar en el reporte */
  municipio: string;
  /** ubicación (latitude, longitude) de la carga a analizar en el reporte */
  ubicacion: Ubicacion;
  /** Array con las muestras/análisis que se han generado para el reporte. */
  woods: WtWood[];
  /**
   * Path local donde está almacenado el reporte en formato xls. Permite conservar el reporte local
   * para cuando no haya conexión y borrar el archivo cuando se purgue el reporte de la colección
   * "wt_reportes"
   */
  localPathXls: string;
  /** Path de Firestorage donde está almacenado el reporte en formato excel. */
  pathXls: string;
  /** URL de descarga de Firestorage, para el reporte en formato excel. */
  urlXls: string;
  /**
   * Path local donde está almacenado el reporte en formato pdf. Permite conservar el reporte local
   * para cuando no haya conexión y borrar el archivo cuando se purgue el reporte de la colección
   * "wt_reportes"
   */
  localPathPdf: string;
  /** Path de Firestorage donde está almacenado el reporte en formato pdf. */
  pathPdf: string;
  /** URL de descarga de Firestorage, para el reporte en formato pdf. */
  urlPdf: string;
  /** ID del "Usuario" de la app WoodTracer que creó el reporte. */
  wtUserId: string;
  /** Fecha de creación del reporte. */
  fCreado: Timestamp | FieldValue | null;
  /** Fecha de modificación del reporte. */
  fModificado: Timestamp | FieldValue | null;
  /**
   * Bandera que indica si la sincronización del reporte se completó exitosamente. Esto, porque una
   * vez creado el reporte en Firestore, es necesario subir los archivos y actualizar las urls
   * apropiadamente. Una vez esto ocurra, se puede marcar el reporte como sincronizado.
   */
  synced: boolean;
  /**
   * uid del Usuario correspondiente a la 'entidad' que crea el reporte.
   */
  wtCompanyId: string;
}

export interface Ubicacion {
  lat: number;
  lng: number;
}
/**
 * Describe un WtReport con el formato apropiado para guardarlo en el localstorage.
 * Todos los campos quedan iguales, excepto los campos "Timestamp" que se convierten a un objeto
 * con el que se pueda reconstruir posteriormente.
 */
export interface LocalStorageWtReport {
  id: string;
  localId: string;
  personaType: string;
  fullName: string;
  docType: number;
  docNumber: string;
  placa: string;
  guia: string;
  departamento: string;
  municipio: string;
  ubicacion: Ubicacion;
  woods: LocalStorageWtWood[];
  localPathXls: string;
  pathXls: string;
  urlXls: string;
  localPathPdf: string;
  pathPdf: string;
  urlPdf: string;
  wtUserId: string;
  fCreado: {
    seconds: number;
    nanoseconds: number;
  };
  fModificado: {
    seconds: number;
    nanoseconds: number;
  };
  synced: boolean;
  wtCompanyId: string;
}

/** Empty Report. */
export const NEW_WT_REPORT: WtReport = {
  id: "0",
  localId: "",
  personaType: "vehiculo",
  fullName: "",
  docType: 0,
  docNumber: "",
  placa: "",
  guia: "",
  departamento: "",
  municipio: "",
  ubicacion: {
    lat: 0,
    lng: 0,
  },
  woods: [],
  localPathXls: "",
  pathXls: "",
  urlXls: "",
  localPathPdf: "",
  pathPdf: "",
  urlPdf: "",
  wtUserId: "",
  fCreado: null,
  fModificado: null,
  synced: false,
  wtCompanyId: "",
};
