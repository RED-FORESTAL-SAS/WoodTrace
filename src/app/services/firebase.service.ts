import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import {
  getStorage,
  ref,
  uploadString,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { getAuth, updatePassword, User as FirebaseUser } from "firebase/auth";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { NotFoundFailure } from "../utils/failure.utils";
import { QueryConstraint } from "../types/query-constraint.type";
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  getDocs,
  limit,
  query,
} from "@angular/fire/firestore";
import { WtUser } from "../models/wt-user";

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
  async uploadPhoto(id, file): Promise<any> {
    const storage = getStorage();
    const storageRef = ref(storage, id);
    return uploadString(storageRef, file, "data_url").then((res) => {
      return this.storage.ref(id).getDownloadURL().toPromise();
    });
  }

  //============Subir Archivos=================
  async uploadBlobFile(id, file): Promise<any> {
    const storage = getStorage();
    const storageRef = ref(storage, id);

    // 'file' comes from the Blob or File API
    return uploadBytes(storageRef, file).then((snapshot) => {
      console.log("Uploaded a blob or file!");
      return this.storage.ref(id).getDownloadURL().toPromise();
    });
  }

  //============Eliminar de FireStorage=================
  deleteFromStorage(path: string) {
    const storage = getStorage();
    const desertRef = ref(storage, path);

    return deleteObject(desertRef);
  }

  // =========Cerrar Sesión===========
  /* Cierra sesión y borra datos almacenados en localstorage. */

  /**
   * @deprecated use UserService.logout instead.
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
   * @deprecated use UserService.logout instead.
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
}
