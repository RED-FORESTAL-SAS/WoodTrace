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
  fNacimiento: Timestamp;
  movil: string;
  /**
   * Dispositivos asociados al usuario.
   */
  devices: Array<{
    model: string;
    uuid: string;
  }>;
}
