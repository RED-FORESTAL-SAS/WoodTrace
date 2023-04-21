/**
 * Describe un  documento de la colección "usuarios" de la plataforma RedForestal, donde el campo
 * "tipo" (Array<string>) contiene el valor "entidad".
 *
 * Company es la Entidad o Empresa, normalmente una entidad pública de control como la policía, una
 * Corporación Autónoma Regional, u otras, que compra la licencia para sus operadores.
 */
export interface WtCompany {
  /** Nombre de la entidad o empesa. */
  nombres: string;
  /** Número de documento de la entidad o empresa. */
  numerodocumento: string;

  /**
   * @todo @diana Terminar de definir los campos.
   */
}

/**
 * Describe un WtCompany con el formato apropiado para guardarlo en el localstorage.
 */
export interface LocaStorageWtCompany extends WtCompany {}
