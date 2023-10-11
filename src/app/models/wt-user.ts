import { Timestamp } from "../types/timestamp.type";

/**
 * Describe la estructura un usuario de la aplicación WoodTracer.
 * Este usuario está almacenado en la colección "wt_users" y es diferente a los usuarios de la 
 * colección "usuarios".
 * 
 * @dev Esta interfaz es más precisa que User y debería de usarse en todo el código.
 */
export interface WtUser {
  /** ID del documento en Firestore. Coincide con el valor UID del User en Firebase Auth. */
  id: string;
  /** Email con el que se registra el usuario en la App. */
  email: string;
  /** 
   * Contraseña creada por el usuario al registrarse. Solo se usa durante el registro, pero no se 
   * almacena en la base de datos.
   */
  password?: string;
  /** Nombre completo del Usuario. */
  fullName: string;
  /** Tipo de documento de identidad del usuario. */
  docType: number;
  /** Número de documento de identidad del usuario. */
  docNumber: string;
  /** Boolean que indica si el email ha sido verificado o no. */
  emailVerified: boolean;
  /** Genero del Usuario. */
  genero: string;
  /** Fecha de nacimiento del usuario */
  fNacimiento: Timestamp | null;
  /** Número del teléfono móvil del usuario. */
  movil: string;
  /** 
   * Array con los dispositivos asociados al usuario. No tienen ningún uso en la App, pero se deja
   * para usos futuros.
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
  /** Boolean que indica si el usuario está activo o no. */
  activo: boolean;
  /** 
   * Boolean que indica si el usuario ya creó o no el primer reporte. Sirve para mostrar/ocultar las
   * ayudas.
   */
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
