import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import {
  getStorage as getStorageLegacy,
  ref as refLegacy,
  uploadString as uploadStringLegacy,
  uploadBytes as uploadBytesLegacy,
  deleteObject as deleteObjectLegacy,
} from "firebase/storage";
import { getAuth, updatePassword, User as FirebaseUser } from "firebase/auth";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { FailureUtils, NotFoundFailure } from "../utils/failure.utils";
import { QueryConstraint } from "../types/query-constraint.type";
import {
  DocumentData,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
} from "@angular/fire/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "@angular/fire/storage";
import { WtUser } from "../models/wt-user";
import { environment } from "src/environments/environment";
import { Photo } from "./camera.service";
import { ImageExtension } from "../types/image-extension.type";

/**
 * @todo @diana Esta clase contiene dependencias a módulos de angular fire en modo compat. Esto
 * debería de migrarse al modo modular y eliminarse la inicialización del archivo app.module.ts.
 */
@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  user = {} as User;
  constructor(
    private firestore: Firestore,
    private router: Router,
    /** @deprecated: Should use firebase modular imports instead. */
    private auth: AngularFireAuth,
    /** @deprecated: Should use firebase modular imports instead. */
    private storage: AngularFireStorage,
    /** @deprecated: Should use firebase modular imports instead. */
    private db: AngularFirestore
  ) {}

  //=========Autenticación==========

  /**
   * Returns authenticated User (from domain) or null if not authenticated.
   *
   * @returns Observable<User | null>
   * @throws FirestoreFailure
   * @deprecated Use UserService.user instead.
   */
  get authState(): Observable<User | null> {
    return this.auth.authState.pipe(
      switchMap((firebaseUser: FirebaseUser | null) => {
        return firebaseUser !== null
          ? this.getDataById("wt_users", firebaseUser.uid)
              .valueChanges()
              .pipe(
                map((user: User | undefined) => {
                  // If user doesn't exist in user collection, fail.
                  if (user === undefined) {
                    throw new NotFoundFailure(
                      "El usuario no existe en la base de datos."
                    );
                  }
                  return { ...user, emailVerified: firebaseUser.emailVerified };
                })
              )
          : of(null);
      })
    );
  }

  /**
   * Signs in user with email and password.
   *
   * @param user Username.
   * @param password Password.
   */
  Login(user: WtUser): Promise<any> {
    return this.auth.signInWithEmailAndPassword(user.email, user.password);
  }

  /** Crear un nuevo usuario
   * @param user
   * autentica al usuario en firebase auth
   * @deprecated Este método tiene dependiencas desactualizadas.
   */

  createUser(user: WtUser) {
    return this.auth.createUserWithEmailAndPassword(user.email, user.password);
  }

  /**
   * Enviar email para recuperar contraseña
   */

  sendRecoveryEmail(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  /**
   * Enviar email para verificación
   */
  async sendEmailVerification() {
    return (await this.auth.currentUser).sendEmailVerification();
  }

  /**
   * It takes a new password as a parameter, gets the current user from the auth object, and then calls
   * the updatePassword function
   * @param {string} newPassword - The new password for the user.
   * @returns A promise that resolves when the password is updated.
   */
  changeUserPassword(newPassword: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    return updatePassword(user, newPassword);
  }

  //========= Funciones Comunes para consultar Firestore==========
  /**
   * @param id Es el id del documento almacenado en una colección.
   * @param collectionName Es el nombre de una colección.
   * @param condition Es la condición para consultar una colección. Ejemplo: ref => ref.where('id', '==', user_id)
   * @param object Es un objeto que contiene datos para guardar o actualizar.
   * @param field Es el campo perteneciente a un documento.
   */

  /**
   * Retorna datos de un documento por su id
   *
   * @deprecated No usar (evitar usar la versión compat de angular fire).
   * Usar fetchDoc de esta misma clase.
   */
  getDataById(collectionName: string, id: string) {
    return this.db.doc(collectionName + "/" + id);
  }

  /**Retorna todos los documentos pertenecientes a una colección*/
  getCollection(collectionName: string) {
    return this.db.collection(collectionName).snapshotChanges();
  }

  /**Retorna todos los documentos pertenecientes a una colección condicionada*/
  getCollectionConditional(collectionName: string, condition) {
    return this.db.collection(collectionName, condition).snapshotChanges();
  }

  /**Agrega un documento nuevo a una colección*/
  addToCollection(collectionName: string, object) {
    return this.db.collection(collectionName).add(object);
  }

  /**Agrega un documento nuevo a una colección asignandole
    un id personalizado al documento */
  addToCollectionById(collectionName: string, object) {
    return this.db.collection(collectionName).doc(object.id).set(object);
  }

  /**Actualiza un documento existente en una colección*/
  async UpdateCollection(collectionName: string, object) {
    return this.db.collection(collectionName).doc(object.id).update(object);
  }

  /**Elimina un documento existente en una colección*/
  deleteFromCollection(collectionName: string, id: string) {
    return this.db.doc(collectionName + "/" + id).delete();
  }

  /**Elimina todos los elementos con un campo similar
   * Se utiliza para hacer eliminaciones relacionales
   * Ejemplo: Todos los productos pertenecientes a una categoría.
   **/
  deleteFromCollectionCascade(
    collectionName: string,
    field: string,
    id: string
  ) {
    return this.db.firestore
      .collection(collectionName)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.query
          .where(field, "==", id)
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              doc.ref.delete();
            });
          });
      });
  }

  //============Subir imagenes=================
  /**
   * @deprecated This method uses legacy imports. Use uploadFileToStorage or uploadStringToStorage
   * instead.
   */
  async uploadPhoto(id, file): Promise<any> {
    const storage = getStorageLegacy();
    const storageRef = refLegacy(storage, id);
    return uploadStringLegacy(storageRef, file, "data_url").then((res) => {
      return this.storage.ref(id).getDownloadURL().toPromise();
    });
  }

  //============Subir Archivos=================
  /**
   * @deprecated This method uses legacy imports. Use uploadFileToStorage or uploadStringToStorage
   * instead.
   */
  async uploadBlobFile(id, file): Promise<any> {
    const storage = getStorageLegacy();
    const storageRef = refLegacy(storage, id);

    // 'file' comes from the Blob or File API
    return uploadBytesLegacy(storageRef, file).then((snapshot) => {
      console.log("Uploaded a blob or file!");
      return this.storage.ref(id).getDownloadURL().toPromise();
    });
  }

  //============Eliminar de FireStorage=================
  /**
   * @deprecated This method uses legacy imports. Use uploadFileToStorage or uploadStringToStorage instead.
   */
  deleteFromStorage(path: string) {
    const storage = getStorageLegacy();
    const desertRef = refLegacy(storage, path);

    return deleteObjectLegacy(desertRef);
  }

  // =========Cerrar Sesión===========
  /* Cierra sesión y borra datos almacenados en localstorage. */

  /**
   * @deprecated use UserService.signOut instead.
   */
  async logout() {
    await this.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("analysis");
    localStorage.removeItem("reports");
    this.router.navigate(["login"]);
  }

  /**
   * Sign out user and deletes local storage data.
   * @deprecated use UserService.signOut instead.
   */
  async signOut(): Promise<void> {
    await this.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("analysis");
    localStorage.removeItem("reports");
  }

  /**
   * Devuelve un Observable con una la colección de Documentos, a partir de un array de QueryConstraint.
   *
   * @param path El path de la colección.
   * @param queryConstraints Un array con las cláusulas necesarias para construir el query.
   * @param options Un objeto con la opción idField, que indica en qué campo debería de poblarse el
   * id de cada documento. Default undefined, para no poblar ningún campo con el id.
   */
  public collection$<T>(
    path: string,
    queryConstraints: QueryConstraint[] = [limit(25)],
    options?:
      | {
          idField?: string | undefined;
        }
      | undefined
  ): Observable<T[]> {
    return collectionData(
      query(collection(this.firestore, path), ...queryConstraints),
      options
    ).pipe(map((r) => r as T[]));
  }

  /**
   * Devuelve una promesa con un array de documentos, dada el path de una colección y  de un array
   * de QueryConstraint.
   *
   * @param path El path de la colección.
   * @param queryConstraints Un array con las cláusulas necesarias para construir el query.
   * @param options Un objeto con la opción idField, que indica en qué campo debería de poblarse el
   * id de cada documento. Default undefined, para no poblar ningún campo con el id.
   */
  public async fetchCollection<T>(
    path: string,
    queryConstraints: QueryConstraint[] = [limit(25)],
    options?:
      | {
          idField?: string | undefined;
        }
      | undefined
  ): Promise<T[]> {
    return (
      await getDocs(
        query(collection(this.firestore, path), ...queryConstraints)
      )
    ).docs.map((snap) => {
      const data = snap.data();
      // Populate document 'idField' with snap.id, if possible.
      if (
        data !== undefined &&
        options !== undefined &&
        options.idField !== undefined
      ) {
        data[`${options.idField}`] = snap.id;
      }
      return data as T;
    });
  }

  /**
   * Observable con el documento de Firestore.
   *
   * @param path path del documento.
   * @param options Un objeto con la opción idField, que indica en qué campo debería de poblarse el
   * id del documento. Default undefined, para no poblar ningún campo con el id.
   */
  public doc$<T>(
    path: string,
    options?:
      | {
          idField?: string | undefined;
        }
      | undefined
  ): Observable<T | undefined> {
    return docData(doc(this.firestore, path), options).pipe(map((r) => r as T));
  }

  /**
   * Devuelve una promesa con un documento, dado un ID. Si el documento no existe, devuelve
   * undefined.
   *
   * @param path path del documento.
   * @param options Un objeto con la opción idField, que indica en qué campo debería de poblarse el
   * id del documento. Default undefined, para no poblar ningún campo con el id.
   */
  public async fetchDoc<T>(
    path: string,
    options?:
      | {
          idField?: string | undefined;
        }
      | undefined
  ): Promise<T | undefined> {
    return await getDoc(doc(this.firestore, path)).then((snap) => {
      const data = snap.data();
      // Populate document 'idField' with snap.id, if possible.
      if (
        data !== undefined &&
        options !== undefined &&
        options.idField !== undefined
      ) {
        data[`${options.idField}`] = snap.id;
      }
      return data as T;
    });
  }

  /**
   * Actualizar un documento en Firestore dado el path y los datos que vayan a actualizarse.
   *
   * @param docPath path del documento (colección/id).
   * @param data Partial con los campos a actualizar.
   * @returns
   * @throws {FirestoreFailure} if update fails.
   */
  public async update<T>(docPath: string, data: Partial<T>): Promise<void> {
    return updateDoc<DocumentData>(doc(this.firestore, docPath), data).catch(
      (e: unknown) => {
        const f = FailureUtils.errorToFailure(e);
        if (!environment.production) {
          console.groupCollapsed(
            `🧰 FirebaseService.update [${docPath}] [error]`
          );
          console.log(f);
          console.log(data);
          console.groupEnd();
        }
        throw f;
      }
    );
  }

  /**
   * Craer un documento en Firestore dado el path y los datos que vayan a crearse.
   *
   * @param colPath path de la colección.
   * @param data  Datos del documento sea completo o Partial.
   * @returns
   */
  public async create<T>(
    colPath: string,
    data: T | Partial<T>
  ): Promise<DocumentReference<DocumentData>> {
    return addDoc<DocumentData>(collection(this.firestore, colPath), data);
  }

  /**
   * Uploads a file to Firebase Storage and returns it's download URL.
   *
   * @param photo {Photo} with the dataUrl to upload.
   * @param folder {String} Path with the folder name.
   * @param fileName {String} Name of the file with or without extension.
   * @returns {String} with the download URL.
   * @throws {StorageFailure} if upload fails.
   */
  public async uploadStringToStorage(
    photo: Photo,
    folder: string,
    fileName: string
  ): Promise<string> {
    const folderWithoutInitialTrailingSlash = folder
      .replace(/^\/+/g, "")
      .replace(/\/+$/, "");
    const fileNameWithoutExtension = this.fileNameFromPath(fileName);
    const fileExt = photo.format;

    const fileRef = ref(
      getStorage(),
      `${folderWithoutInitialTrailingSlash}/${fileNameWithoutExtension}.${fileExt}`
    );
    await uploadString(fileRef, photo.dataUrl, "data_url").catch(
      (e: unknown) => {
        const f = FailureUtils.errorToFailure(e);
        if (!environment.production) {
          console.groupCollapsed(`🧰 FirebaseService.uploadString [error]`);
          console.log(f);
          console.log({ photo, folder, fileName });
          console.groupEnd();
        }
        throw f;
      }
    );
    return getDownloadURL(fileRef);
  }

  /**
   * Agrega un prefijo alfanumérico para hacer único el nombre del archivo.
   *
   * @param fileName Nombre del archivo
   * @returns {string}
   */
  public static generateUniqueFilename(fileName: string): string {
    return (
      Math.random().toString(36).substring(2, 8) +
      Math.random().toString(36).substring(2, 8) +
      ((Date.now() / 1000) | 0) +
      "_" +
      fileName
    );
  }

  /**
   * Devuelve el nombre del archivo a partir de un path o nombre del archivo.
   *
   * @param path Path o nombre del archivo.
   * @param excludeExtension Si la extensión debe excluirse o no. Default false.
   * @returns string con el nombre del archivo.
   */
  private fileNameFromPath(path: string, excludeExtension = false): string {
    const slashIndex = path.lastIndexOf("/");
    const slash = slashIndex !== undefined ? slashIndex + 1 : 0;

    if (!excludeExtension) {
      return path.substring(slash);
    }

    const dot = path.lastIndexOf(".");
    return path.substring(slash, dot);
  }
}
