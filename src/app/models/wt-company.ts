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
  /** Apellidos de la entidad o empresa */
  apellidos: string;
  /** Número de documento de la entidad o empresa. */
  numerodocumento: string;
  /** Dirección de la entidad*/
  direccion: string;
  /** Pais de la entidad */
  pais: string;
  /** Departamento de la entidad */
  departamento: string;
  /** Ciudad o municipio de la entidad */
  municipio: string;
}

/**
 * Describe un WtCompany con el formato apropiado para guardarlo en el localstorage.
 */
export interface LocaStorageWtCompany extends WtCompany {}
