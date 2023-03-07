import { FirestoreError } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { environment } from "src/environments/environment";

export class FailureUtils {
  /**
   * Devuelve un Failure a partir de un Error.
   *
   * @param e Cualquier error.
   * @returns Failure
   */
  public static errorToFailure(e: unknown): Failure {
    let f;
    if (e instanceof FirebaseError || e instanceof FirestoreError) {
      const code = e.code;
      switch (code) {
        case "auth/account-exists-with-different-credential":
          f = new AuthAccountExistsWithDifferentCredentialFailure(e.message);
          break;
        case "auth/credential-already-in-use":
          f = new AuthCredentialAlreadyInUseFailure(e.message);
          break;
        case "auth/email-already-in-use":
          f = new AuthEmailAlreadyInUseFailure(e.message);
          break;
        case "auth/expired-action-code":
          f = new AuthExpiredActionCodeFailure(e.message);
          break;
        case "auth/invalid-action-code":
          f = new AuthInvalidActionCodeFailure(e.message);
          break;
        case "auth/invalid-argument":
          f = new AuthInvalidArgumentFailure(e.message);
          break;
        case "auth/invalid-email":
          f = new AuthInvalidEmailFailure(e.message);
          break;
        case "auth/network-request-failed":
          f = new AuthNetworkRequestFailedFailure(e.message);
          break;
        case "auth/operation-not-allowed":
          f = new AuthOperationNotAllowedFailure(e.message);
          break;
        case "auth/popup-closed-by-user":
          f = new AuthPopupClosedByUserFailure(e.message);
          break;
        case "auth/timeout":
          f = new AuthTimeoutFailure(e.message);
          break;
        case "auth/too-many-requests":
          f = new AuthTooManyRequestsFailure(e.message);
          break;
        case "auth/user-disabled":
          f = new AuthUserDisabledFailure(e.message);
          break;
        case "auth/user-not-found":
          f = new AuthUserNotFoundFailure(e.message);
          break;
        case "auth/weak-password":
          f = new AuthWeakPasswordFailure(e.message);
          break;
        case "auth/web-storage-unsupported":
          f = new AuthWebStorageUnsupportedFailure(e.message);
          break;
        case "auth/wrong-password":
          f = new AuthWrongPasswordFailure(e.message);
          break;
        case "aborted":
          f = new AbortedFailure(e.message);
          break;
        case "already-exists":
          f = new AlreadyExistsFailure(e.message);
          break;
        case "cancelled":
          f = new CancelledFailure(e.message);
          break;
        case "data-loss":
          f = new DataLossFailure(e.message);
          break;
        case "deadline-exceeded":
          f = new DeadlineExceededFailure(e.message);
          break;
        case "failed-precondition":
          f = new FailedPreconditionFailure(e.message);
          break;
        case "internal":
          f = new InternalFailure(e.message);
          break;
        case "invalid-argument":
          f = new InvalidArgumentFailure(e.message);
          break;
        case "no-network":
          f = new NoNetworkFailure(e.message);
          break;
        case "not-found":
          f = new NotFoundFailure(e.message);
          break;
        case "out-of-range":
          f = new OutOfRangeFailure(e.message);
          break;
        case "permission-denied":
          f = new PermissionDeniedFailure(e.message);
          break;
        case "resource-exhausted":
          f = new ResourceExhaustedFailure(e.message);
          break;
        case "unauthenticated":
          f = new UnauthenticatedFailure(e.message);
          break;
        case "unavailable":
          f = new UnavailableFailure(e.message);
          break;
        case "unimplemented":
          f = new UnimplementedFailure(e.message);
          break;
        case "storage/unknown":
          f = new StorageUnknownFailure(e.message);
          break;
        case "storage/object-not-found":
          f = new StorageObjectNotFoundFailure(e.message);
          break;
        case "storage/bucket-not-found":
          f = new StorageBucketNotFoundFailure(e.message);
          break;
        case "storage/project-not-found":
          f = new StorageProjectNotFoundFailure(e.message);
          break;
        case "storage/quota-exceeded":
          f = new StorageQuotaExceededFailure(e.message);
          break;
        case "storage/unauthenticated":
          f = new StorageUnauthenticatedFailure(e.message);
          break;
        case "storage/unauthorized":
          f = new StorageUnauthorizedFailure(e.message);
          break;
        case "storage/retry-limit-exceeded":
          f = new StorageRetryLimitExceededFailure(e.message);
          break;
        case "storage/invalid-checksum":
          f = new StorageInvalidChecksumFailure(e.message);
          break;
        case "storage/canceled":
          f = new StorageCanceledFailure(e.message);
          break;
        case "storage/invalid-event-name":
          f = new StorageInvalidEventNameFailure(e.message);
          break;
        case "storage/invalid-url":
          f = new StorageInvalidUrlFailure(e.message);
          break;
        case "storage/invalid-argument":
          f = new StorageInvalidArgumentFailure(e.message);
          break;
        case "storage/no-default-bucket":
          f = new StorageNoDefaultBucketFailure(e.message);
          break;
        case "storage/cannot-slice-blob":
          f = new StorageCannotSliceBlobFailure(e.message);
          break;
        case "storage/server-file-wrong-size":
          f = new StorageServerFileWrongSizeFailure(e.message);
          break;
        case "unknown":
        default:
          f = new UnknownFailure(e.message);
          break;
      }
      // Just rethrow same Failure.
    } else if (e instanceof Failure) {
      f = e;
    } else if (e instanceof Error) {
      const message = e.message;
      switch (message) {
        case "no-network":
          f = new NoNetworkFailure(e.message);
          break;
        case "not-found":
          f = new NotFoundFailure(e.message);
          break;
        default:
          f = new UnknownFailure(e.message);
          break;
      }
    } else {
      f = new UnknownFailure("");
    }

    return f;
  }

  /**
   * Logs a failure to console.
   *
   * @param failure Failure to log.
   * @param data Relevan data to show with error.
   * @param where Where did de Failure ocurred.
   * @param includeProductionEnvironment If logs should be shown on Production.
   */
  public static log(
    failure: Failure,
    where: string = "",
    data: any = null,
    includeProductionEnvironment: boolean = false
  ): void {
    if (!environment.production || includeProductionEnvironment) {
      console.groupCollapsed(`🦧 [Failure: ${where}] [${failure.code}]`);
      console.log("failure", failure);
      if (data) {
        console.log("data", data);
      }
      console.groupEnd();
    }
  }
}

/**
 * Describe un Failure de la app.
 */
export class Failure extends Error {
  public code = "";
  constructor(message: string, code: string | null = null) {
    super(message);
    if (code) {
      this.code = code;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Lista los Auth Failures para cada codigo de error de FirebaseAuth.
 *
 * En caso de que falte alguno, ver el listado completo de los errores de la Auth API.
 * https://firebase.google.com/docs/auth/admin/errors
 *
 * Ver los errores que genera cada método en
 * https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth
 */
export type AuthFailure =
  | AuthAccountExistsWithDifferentCredentialFailure
  | AuthCredentialAlreadyInUseFailure
  | AuthEmailAlreadyInUseFailure
  | AuthExpiredActionCodeFailure
  | AuthInvalidActionCodeFailure
  | AuthInvalidArgumentFailure
  | AuthInvalidEmailFailure
  | AuthNetworkRequestFailedFailure
  | AuthOperationNotAllowedFailure
  | AuthPopupClosedByUserFailure
  | AuthTimeoutFailure
  | AuthTooManyRequestsFailure
  | AuthUserDisabledFailure
  | AuthUserNotFoundFailure
  | AuthWeakPasswordFailure
  | AuthWebStorageUnsupportedFailure
  | AuthWrongPasswordFailure
  | FailedPreconditionFailure
  | PermissionDeniedFailure
  | UnknownFailure;

/**
 * Lista los Firestore Failures para cada código de error de Firestore:
 *
 * Ver https://firebase.google.com/docs/reference/node/firebase.firestore#firestoreerrorcode
 */
export type FirestoreFailure =
  | AbortedFailure
  | AlreadyExistsFailure
  | CancelledFailure
  | DataLossFailure
  | DeadlineExceededFailure
  | FailedPreconditionFailure
  | InternalFailure
  | InvalidArgumentFailure
  | NoNetworkFailure
  | NotFoundFailure
  | OutOfRangeFailure
  | PermissionDeniedFailure
  | ResourceExhaustedFailure
  | UnauthenticatedFailure
  | UnimplementedFailure
  | UnavailableFailure
  | UnknownFailure;

/**
 * Lista de los StorageFailure para cada código de error de Firestore:
 *
 * https://firebase.google.com/docs/storage/web/handle-errors
 */
export type StorageFailure =
  | StorageUnknownFailure
  | StorageObjectNotFoundFailure
  | StorageBucketNotFoundFailure
  | StorageProjectNotFoundFailure
  | StorageQuotaExceededFailure
  | StorageUnauthenticatedFailure
  | StorageUnauthorizedFailure
  | StorageRetryLimitExceededFailure
  | StorageInvalidChecksumFailure
  | StorageCanceledFailure
  | StorageInvalidEventNameFailure
  | StorageInvalidUrlFailure
  | StorageInvalidArgumentFailure
  | StorageNoDefaultBucketFailure
  | StorageCannotSliceBlobFailure
  | StorageServerFileWrongSizeFailure
  | UnknownFailure;

/**
 * Auth Account Exists With Different Credential Failure.
 * Code 'auth/account-exists-with-different-credential'.
 * Thrown if there already exists an account with the email address asserted by the credential.
 */
export class AuthAccountExistsWithDifferentCredentialFailure extends Failure {
  code = "auth/account-exists-with-different-credential";
}

/**
 * Auth Credential Already In Use Failure.
 * Code 'auth/credential-already-in-use'.
 * Thrown if the account corresponding to the credential already exists among your users, or is
 * already linked to a Firebase User.
 */
export class AuthCredentialAlreadyInUseFailure extends Failure {
  code = "auth/credential-already-in-use";
}

/**
 * Auth Email Already In Use Failure.
 * Code 'auth/email-already-in-use'.
 * Thrown if there already exists an account with the given email address.
 */
export class AuthEmailAlreadyInUseFailure extends Failure {
  code = "auth/email-already-in-use";
}

/**
 * Auth Expired Action Code Failure.
 * Code 'auth/expired-action-code'.
 * Thrown if the action code has expired.
 */
export class AuthExpiredActionCodeFailure extends Failure {
  code = "auth/expired-action-code";
}

/**
 * Auth Invalid Action Code Failure
 * Code 'auth/invalid-action-code'.
 * Thrown if the action code is invalid. This can happen if the code is malformed or has already
 * been used.
 */
export class AuthInvalidActionCodeFailure extends Failure {
  code = "auth/invalid-action-code";
}

/**
 * Auth Invalid Argument Failure.
 * Code 'auth/invalid-argument'.
 * An invalid argument was provided to an Authentication method. The error message should contain
 * additional information.
 */
export class AuthInvalidArgumentFailure extends Failure {
  code = "auth/invalid-argument";
}

/**
 * Auth Invalid Email Failure.
 * Code 'auth/invalid-email'.
 * Thrown if the email address is not valid.
 */
export class AuthInvalidEmailFailure extends Failure {
  code = "auth/invalid-email";
}

/**
 * Auth Network Request Failed Failure.
 * Code 'auth/network-request-failed'.
 * Falló la solicitud. Una razón es que environments.useEmulators esta en true y se está intentando
 * hacer una solicitud a una instancia de Firebase.
 */
export class AuthNetworkRequestFailedFailure extends Failure {
  code = "auth/network-request-failed";
}

/**
 * Auth Operation Not Allowed Failure
 * Code 'auth/operation-not-allowed'.
 * The provided sign-in provider is disabled for your Firebase project. Enable it from the Sign-in
 * Method section of the Firebase console.
 */
export class AuthOperationNotAllowedFailure extends Failure {
  code = "auth/operation-not-allowed";
}

/**
 * Auth Popup Closed By User Failure.
 * Code 'auth/popup-closed-by-user'.
 * El usuario cerró el popup para la autenticación.
 */
export class AuthPopupClosedByUserFailure extends Failure {
  code = "auth/popup-closed-by-user";
}

/**
 * Auth Timeout Failure.
 * Code 'auth/timeout'.
 * Thrown typically if the app domain is not authorized for OAuth operations for your Firebase
 * project.
 */
export class AuthTimeoutFailure extends Failure {
  code = "auth/timeout";
}

/**
 * Auth Timeout Failure.
 * Code 'auth/too-many-requests.
 * Demasiados intentos de autenticación. La cuenta ha sido bloqueada temporalmente.
 */
export class AuthTooManyRequestsFailure extends Failure {
  code = "auth/too-many-requests";
}

/**
 * Auth User Disabled Failure.
 * Code 'auth/user-disabled'.
 * Thrown if user is disabled.
 */
export class AuthUserDisabledFailure extends Failure {
  code = "auth/user-disabled";
}

/**
 * Auth User Not Found Failure.
 * Code 'auth/user-not-found'.
 * Thrown if there is no user corresponding to the email address.
 */
export class AuthUserNotFoundFailure extends Failure {
  code = "auth/user-not-found";
}

/**
 * Auth Weak Password Failure.
 * Code 'auth/weak-password'.
 * Thrown if the new password is not strong enough.
 */
export class AuthWeakPasswordFailure extends Failure {
  code = "auth/weak-password";
}

/**
 * Auth Web Storage Unsupported Failure.
 * Code 'auth/web-storage-unsupported'.
 * El navegador del usuario no permite almacentamiento local.
 */
export class AuthWebStorageUnsupportedFailure extends Failure {
  code = "auth/web-storage-unsupported";
}
/**
 * Auth Wrong Password Failure
 * Code 'auth/wrong-password'.
 * Thrown if signing in with wrong password.
 */
export class AuthWrongPasswordFailure extends Failure {
  code = "auth/wrong-password";
}

/**
 * Aborted Failure.
 * FirestoreErrorCode 'aborted'.
 * The operation was aborted, typically due to a concurrency issue like transaction aborts, etc.
 */
export class AbortedFailure extends Failure {
  code = "aborted";
}

/**
 * Already Exists Failure.
 * FirestoreErrorCode 'already-exists'.
 * Some document that we attempted to create already exists.
 */
export class AlreadyExistsFailure extends Failure {
  code = "already-exists";
}

/**
 * Cancelled Operation Failure.
 * FirestoreErrorCode 'cancelled'.
 * The operation was cancelled (typically by the caller).
 */
export class CancelledFailure extends Failure {
  code = "cancelled";
}

/**
 * DataLoss Failure.
 * FirestoreErrorCode 'data-loss': Unrecoverable data loss or corruption.
 */
export class DataLossFailure extends Failure {
  code = "data-loss";
}

/**
 * Deadline Exceeded Failure.
 * FirestoreErrorCode 'deadline-exceeded'.
 * Deadline expired before operation could complete. For operations that change the state of the
 * system, this error may be returned even if the operation has completed successfully. For example,
 * a successful response from a server could have been delayed long enough for the deadline to
 * expire.
 */
export class DeadlineExceededFailure extends Failure {
  code = "deadline-exceeded";
}

/**
 * Failed Precondition Failure.
 * FirestoreErrorCode 'failed-precondition'.
 * Operation was rejected because the system is not in a state required for the operation's
 * execution. Ej: cuando no hay una app inicializada.
 */
export class FailedPreconditionFailure extends Failure {
  code = "failed-precondition";
}

/**
 * Internal Failure.
 * FirestoreErrorCode 'internal'.
 * Internal errors. Means some invariants expected by underlying system has been broken.
 * If you see one of these errors, something is very broken.
 */
export class InternalFailure extends Failure {
  code = "internal";
}

/**
 * Invalid Argument Failure.
 * Code 'invalid-argument'.
 * An invalid argument was provided. The error message should contain additional information.
 */
export class InvalidArgumentFailure extends Failure {
  code = "invalid-argument";
}

/**
 * No Network Failure.
 * Code 'no-network'.
 * No Internet Network Failure. No es un código de error de Firebase, pero se inlcuye aquí, pues
 * hace parte de las validaciones que se incluyen en las llamadas.
 */
export class NoNetworkFailure extends Failure {
  code = "not-network";
}

/**
 * Not Found Failure.
 * FirestoreErrorCode 'not-found'.
 * Some requested document was not found.
 */
export class NotFoundFailure extends Failure {
  code = "not-found";
}

/**
 * Out Of Range Failure.
 * FirestoreErrorCode 'out-of-range'.
 * Operation was attempted past the valid range.
 */
export class OutOfRangeFailure extends Failure {
  code = "out-of-range";
}

/**
 * Permission Denied Failure.
 * FirestoreErrorCode 'permission-denied'.
 * The caller does not have permission to execute the specified operation. Incluye cuando se
 * autentica con una cuenta que no está autorizada.
 */
export class PermissionDeniedFailure extends Failure {
  code = "permission-denied";
}

/**
 * Resource Exhausted Failure.
 * FirestoreErrorCode 'resource-exhausted'.
 * Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is
 * out of space.
 */
export class ResourceExhaustedFailure extends Failure {
  code = "resource-exhausted";
}

/**
 * Unauthenticated Failure.
 * FirestoreErrorCode 'unauthenticated': The request does not have valid authentication credentials
 * for the operation.
 */
export class UnauthenticatedFailure extends Failure {
  code = "unauthenticated";
}

/**
 * Unavailable Failure.
 * FirestoreErrorCode 'unavailable': The service is currently unavailable.
 * This is most likely a transient condition and may be corrected by retrying with a backoff.
 */
export class UnavailableFailure extends Failure {
  code = "unavailable";
}

/**
 * Unimplemented Failure.
 * FirestoreErrorCode 'unimplemented'.
 * Operation is not implemented or not supported/enabled.
 */
export class UnimplementedFailure extends Failure {
  code = "unimplemented";
}

/**
 * Unknown Failure.
 * FirestoreErrorCode 'unknown'.
 * Unknown error or an error from a different error domain.
 */
export class UnknownFailure extends Failure {
  code = "unknown";
}

/**
 * Storage Unknown.
 * StorageErrorCode 'storage/unknown'.
 * Ocurrió un error desconocido.
 */
export class StorageUnknownFailure extends Failure {
  code = "storage/unknown";
}

/**
 * Storage Object No Found.
 * StorageErrorCode 'storage/object-not-found'.
 * No existe ningún objeto en la referencia deseada.
 */
export class StorageObjectNotFoundFailure extends Failure {
  code = "storage/object-not-found";
}

/**
 * Storage Bucket Not Found.
 * StorageErrorCode 'storage/bucket-not-found'.
 * No se configuró ningún bucket para Cloud Storage.
 */
export class StorageBucketNotFoundFailure extends Failure {
  code = "storage/bucket-not-found";
}

/**
 * Storage Project Not Found.
 * StorageErrorCode 'storage/project-not-found'.
 * No se configuró ningún proyecto para Cloud Storage.
 */
export class StorageProjectNotFoundFailure extends Failure {
  code = "storage/project-not-found";
}

/**
 * Storage Quota Exceeded.
 * StorageErrorCode 'storage/quota-exceeded'.
 * Se superó la cuota del bucket de Cloud Storage. Si estás en el nivel sin costo, deberás
 * actualizar a un plan pagado. Si estás en un plan pagado, comunícate con el personal de asistencia
 * de Firebase.
 */
export class StorageQuotaExceededFailure extends Failure {
  code = "storage/quota-exceeded";
}

/**
 * Storage Unauthenticated.
 * StorageErrorCode 'storage/unauthenticated'.
 * El usuario no se autenticó. Vuelve a intentarlo después de realizar la autenticación.
 */
export class StorageUnauthenticatedFailure extends Failure {
  code = "storage/unauthenticated";
}

/**
 * Storage Unauthorized.
 * StorageErrorCode 'storage/unauthorized'.
 * El usuario no está autorizado para realizar la acción deseada. Consulta las reglas de seguridad
 * para asegurarte de que sean correctas.
 */
export class StorageUnauthorizedFailure extends Failure {
  code = "storage/unauthorized";
}

/**
 * Storage Retry Limit Exceeded.
 * StorageErrorCode  'storage/retry-limit-exceeded'.
 * Se superó el límite de tiempo máximo permitido para una operación (de carga, descarga,
 * eliminación, etc.). Vuelve a subirlo.
 */
export class StorageRetryLimitExceededFailure extends Failure {
  code = "storage/retry-limit-exceeded";
}

/**
 * Storage Invalid Checksum.
 * StorageErrorCode 'storage/invalid-checksum'.
 * El archivo del cliente no coincide con la suma de verificación del archivo que recibió el
 * servidor. Vuelve a subirlo.
 */
export class StorageInvalidChecksumFailure extends Failure {
  code = "storage/invalid-checksum";
}

/**
 * Storage Canceled.
 * StorageErrorCode 'storage/canceled'.
 * El usuario canceló la operación.
 */
export class StorageCanceledFailure extends Failure {
  code = "storage/canceled";
}

/**
 * Storage Invalid Event Name.
 * StorageErrorCode 'storage/invalid-event-name'.
 * Se proporcionó un nombre de evento no válido. El modo debe ser uno de los siguientes: `running`,
 * `progress` o `pause`.
 */
export class StorageInvalidEventNameFailure extends Failure {
  code = "storage/invalid-event-name";
}

/**
 * Storage Invalid Url.
 * StorageErrorCode 'storage/invalid-url'.
 * Se proporcionó una URL no válida a refFromURL(). Debes usar el formato gs://bucket/object o
 * https://firebasestorage.googleapis.com/v0/b/bucket/o/object?token=&ltTOKEN>
 */
export class StorageInvalidUrlFailure extends Failure {
  code = "storage/invalid-url";
}

/**
 * Storage Invalid Argument.
 * StorageErrorCode 'storage/invalid-argument'.
 * El argumento que se pase a put() debe ser un arreglo de tipo `File`, `Blob` o `UInt8`. El
 * argumento que se pase a putString() debe ser una string sin procesar `Base64` o `Base64URL`.
 */
export class StorageInvalidArgumentFailure extends Failure {
  code = "storage/invalid-argument";
}

/**
 * Storage No Default Bucket.
 * StorageErrorCode 'storage/no-default-bucket'.
 * No se estableció ningún bucket en la propiedad storageBucket de tu configuración.
 */
export class StorageNoDefaultBucketFailure extends Failure {
  code = "storage/no-default-bucket";
}

/**
 * Storage Cannot Slice Blob.
 * StorageErrorCode 'storage/cannot-slice-blob'.
 * Ocurre generalmente cuando hubo un cambio en el archivo local (se borró, se volvió a guardar,
 * etc.) Intenta volver a subirlo después de verificar que el archivo no haya cambiado.
 */
export class StorageCannotSliceBlobFailure extends Failure {
  code = "storage/cannot-slice-blob";
}

/**
 * Storage Server File Wrong Size.
 * StorageErrorCode 'storage/server-file-wrong-size'.
 * El archivo del cliente no coincide con el tamaño del archivo que recibió el servidor. Vuelve a
 * subirlo.
 */
export class StorageServerFileWrongSizeFailure extends Failure {
  code = "storage/server-file-wrong-size";
}

/**
 * Describe un Failure ocurrido durante el consumo de una API externa, tanto en el BackEnd como en
 * el FrontEnd.
 */
export class ApiFailure extends Failure {}
