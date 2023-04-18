/**
 * Describe una licencia para el uso de la app WoodTracer. Los documentos se almacenarán
 * en la colección "wt_licences".
 *
 * El propósito del documento WtLicence es asociar una "Entidad" con una Licencia para
 * usar la aplicación WoodTracer. Dicha Licencia esta limitada por una fecha de inicio
 * y finalización y puede ser redimida/usada por uno (y solo un) "Usuario" a la vez.
 *
 * Las licencias solo pueden ser creadas por un rol "administrador" de RedForestal, una por
 * una o en "batch", asociando una "Entidad" y las fechas de inicio y fin. Al crearse, cada
 * licencia generará automáticamente un codigo. Con dicho codigo, la "Entidad" podrá pedirle
 * a uno de sus colaboradores que use la app WoodTracer para "Redimir" la Licencia.
 *
 * Una "Entidad" no podrá crear una Licencia, ni editarla. Pero sí podrá "Liberar la Licencia"
 * para que un nuevo usuario pueda "Redimirla".
 *
 * 1️⃣ Entiéndase "Entidad" como un documento de la colección "usuarios" de la plataforma
 * RedForestal, donde el campo "tipo" (Array<string>) contiene el valor "entidad".
 *
 * 2️⃣ Entiendase "Usuario" como un documento de la colección "wt_users", es decir, un usuario
 * registrado a través de la app WoodTracer.
 *
 * 3️⃣ Entiéndase "Redimir una Licencia" como el proceso en el que un "Usuario" de la app
 * WoodTracer redime un codigo de una Licencia y el campo wtUserId es poblado con su UID.
 *
 * 4️⃣ Entiéndase "Liberar una Licencia" como el proceso de eliminar el "Usuario" asociado
 * a la licencia, poniendo un string vacío en el valor del campo wtUserId. Esto debe generar
 * que la Licencia regenere el código almacenado en el campo redeemCode. De esta manera el
 * usuario anterior ya no podrá activar la licencia y un nuevo usuario podrá redimir de nuevo
 * la licencia con un código diferente.
 */
export interface WtLicense {
  /** ID del documento. */
  id: string;
  /**
   * Estado de la Licencia. Si bien la vigencia de la Licencia puede determinarse a partir
   * del campo "ends", tener un estado permite que un cron pueda consultar las licencias
   * caducadas pero que aún no se marcan con el status "inactive". y así poder procesarlas
   * para ajustar las estadísticas y enviar las notificaciones necesarias.
   */
  status: "active" | "inactive";
  /** ID de la "Entidad" propietaria de la Licencia. */
  entidadId: string;
  /** ID del "Usuario" de la app WoodTracer que "Redimió" la Licencia. */
  wtUserId: string;
  /** Fecha de inicio de la vigencia de la Licencia. */
  begins: string;
  /** Fecha de finalización de la vigencia de la Licencia. */
  ends: string;
  /** Codigo único para "Redimir" la licencia. */
  redeemCode: string;
}
