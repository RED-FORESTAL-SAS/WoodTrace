import { Timestamp } from "../types/timestamp.type";

/**
 * Describe la estructura un usuario de la aplicación.
 * Esta interfaz es más precisa que User y debería de usarse en todo el código.
 */
export interface WtUser {
  /** id del usario */
  id: string;
  /** Email del usuario */
  email: string;
  /**
   * Solo para uso local. Cuando se envía al servidor, se elimina.
   */
  /** Contraseña del usuario */
  password?: string;
  /** Nombre completo del usuario */
  fullName: string;
  /** Tipo de documento del usuario */
  docType: number;
  /** Documento de identidad del usuario */
  docNumber: string;
  /** Indica si el usuario ha verificado su correo electrónico */
  emailVerified: boolean;
  /** Género del usuario */
  genero: string;
  /** Fecha de nacimiento del usuario */
  fNacimiento: Timestamp | null;
  /** Número de teléfono móvil del usuario */
  movil: string;
  /**
   * Dispositivos asociados al usuario.
   */
  devices: Array<{
    model: string;
    uuid: string;
  }>;
  /**
   * String with profile picture. In Firestore is stored the download URL. In localstorage is
   * stored as/converted to a base64 data url.
   */
  photo: string;
  /*Indica si el usuario está activo o no. Un usuario se desactiva cuando utiliza la funcion de eliminar cuenta. */
  activo: boolean;
  /** Indica si el usuario ha realizado su primer reporte. */
  firstReport: boolean;
}

/**
 * Describe un WtUser con el formato apropiado para guardarlo en el localstorage.
 * Todos los campos quedan iguales, excepto los campos "Timestamp" que se convierten a un objeto
 * con el que se pueda reconstruir posteriormente.
 */
export interface LocalStorageWtUser {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  docType: number;
  docNumber: string;
  emailVerified: boolean;
  genero: string;
  fNacimiento: {
    seconds: number;
    nanoseconds: number;
  };
  movil: string;
  devices: Array<{
    model: string;
    uuid: string;
  }>;
  photo: string;
  activo: boolean;
  firstReport: boolean;
}
