import { Timestamp } from "../types/timestamp.type";

/**
 * Describe la estructura un usuario de la aplicación.
 * Esta interfaz es más precisa que User y debería de usarse en todo el código.
 *
 * @todo @diana terminar de documentar campos.
 */
export interface WtUser {
  id: string;
  email: string;
  /**
   * Solo para uso local. Cuando se envía al servidor, se elimina.
   */
  password?: string;
  fullName: string;
  docType: number;
  docNumber: string;
  emailVerified: boolean;
  genero: string;
  fNacimiento: Timestamp | null;
  movil: string;
  /**
   * Dispositivos asociados al usuario.
   */
  devices: Array<{
    model: string;
    uuid: string;
  }>;
  photo: string;
  activo: boolean;
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
}
