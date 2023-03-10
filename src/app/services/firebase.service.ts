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

@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  user = {} as User;
  constructor(
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private router: Router
  ) {}

  //=========Autenticación==========

  /**
   * Returns authenticated User (from domain) or null if not authenticated.
   *
   * @returns Observable<User | null>
   * @throws FirestoreFailure
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
  Login(user: User): Promise<any> {
    return this.auth.signInWithEmailAndPassword(user.email, user.password);
  }

  /** Crear un nuevo usuario
   * @param user
   * autentica al usuario en firebase auth
   */

  createUser(user: User) {
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

  /**Retorna datos de un documento por su id*/
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

  async logout() {
    await this.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("analysis");
    localStorage.removeItem("reports");
    this.router.navigate(["login"]);
  }

  /**
   * Sign out user and deletes local storage data.
   */
  async signOut(): Promise<void> {
    await this.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("analysis");
    localStorage.removeItem("reports");
  }
}
