import { Injectable, OnDestroy } from "@angular/core";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { CURRENT_USER_LS_KEY } from "../constants/current-user-ls-key.constant";
import { UserStore } from "../state/user.store";
import { WtCompany } from "../models/wt-company";
import { Observable, Subscription, of } from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  skip,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { WtLicense } from "../models/wt-license";
import { LicenseFailure, LicenseService } from "./license.service";
import { CompanyService } from "./company.service";
import { FirebaseService, FirebaseUser } from "./firebase.service";
import { Timestamp } from "../types/timestamp.type";
import { limit, orderBy, where } from "../types/query-constraint.type";
import { LICENCES_FB_COLLECTION } from "../constants/licenses-fb-collection";
import {
  Failure,
  FailureUtils,
  NoNetworkFailure,
  NotFoundFailure,
  UnauthenticatedFailure,
} from "../utils/failure.utils";
import { COMPANYS_FB_COLLECTION } from "../constants/compays-fb-collection";
import { USERS_FB_COLLECTION } from "../constants/users-fb-collection";
import { LocalStorageWtUser, WtUser } from "../models/wt-user";
import { environment } from "src/environments/environment";
import { Photo } from "./camera.service";
import { NetworkRepository } from "../infrastructure/network.repository";
import { UserCredential } from "@angular/fire/auth";

export class UserFailure extends Failure {}

@Injectable({ providedIn: "root" })
export class UserService implements OnDestroy {
  private sbs: Subscription[] = [];

  constructor(
    private companyService: CompanyService,
    private firebase: FirebaseService,
    private localStorage: LocalStorageRepository,
    private licenseService: LicenseService,
    private network: NetworkRepository,
    private store: UserStore
  ) {
    this.sbs.push(
      // Watch for changes in License and retrieve/clean Company.
      this.license
        .pipe(
          filter((license) => !!license), // Avoid null emissionS.
          distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
        )
        .subscribe((license: WtLicense) => {
          this.retrieveUserCompany().catch((e) => {
            this.patchError(e);
          });
        }),

      // Watch for changes in User and retrieve/clean License.
      this.user
        .pipe(
          skip(1), // Avoid first null emission.
          distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
          withLatestFrom(this.online) // Force online check.
        )
        .subscribe(async ([user, online]: [WtUser | null, boolean]) => {
          if (user) {
            await this.retrieveActiveLicense().catch((e) => {
              this.patchError(e);
            });
          } else {
            this.patchLicense(null);
            this.patchCompany(null);
          }
        })
    );

    // Retrieve authenticated user and watch for changes in authState.
    this.retrieveAuthenticatedUser();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  /**
   * Getter for company from state.
   */
  get company(): Observable<WtCompany | null> {
    return this.store.state$.pipe(map((state) => state.company));
  }

  /**
   * Getter for license from state.
   */
  get license(): Observable<WtLicense | null> {
    return this.store.state$.pipe(map((state) => state.license));
  }

  /**
   * Getter for autenticated user from state.
   */
  get user(): Observable<WtUser | null> {
    return this.store.state$.pipe(map((state) => state.user));
  }

  /**
   * Getter for error from state.
   */
  get error(): Observable<Failure | null> {
    return this.store.state$.pipe(map((state) => state.error));
  }

  /**
   * Returns the current authenticated user from state.
   *
   * @returns
   */
  get currentUser(): WtUser | null {
    return this.store.state.user;
  }

  /**
   * Returns if device is online or not.
   */
  get online(): Observable<boolean> {
    return this.network.online$;
  }

  /**
   * Getters that returns a WtUser from a AuthState/Firebase or null if not autenticated.
   *
   * @returns Observable<User | null>
   * @throws FirestoreFailure
   */
  get authState(): Observable<WtUser | null> {
    return this.firebase.authState.pipe(
      switchMap((firebaseUser: FirebaseUser | null) => {
        return firebaseUser !== null
          ? this.firebase
              .doc$<WtUser>(`${USERS_FB_COLLECTION}/${firebaseUser.uid}`)
              .pipe(
                map((user: WtUser | undefined) => {
                  // Returned user can be undefined if document doesn't exist or if there is a
                  // network error.
                  if (user === undefined) {
                    // In case network is offline, try to retrieve user from localstorage.
                    const localstorageUser = this.fetchUserFromLocalStorage();
                    if (
                      localstorageUser &&
                      localstorageUser.id === firebaseUser.uid
                    ) {
                      return localstorageUser;
                    }

                    // If user is not in localstorage or is not the same as the authenticated,
                    // clean local storage and return null.
                    if (localstorageUser) {
                      this.saveUserToLocalStorage(null);
                    }
                    return null;

                    /**
                     * @todo @mario Debe cerrarse la sesión de firebase cuando esto ocurre?
                     */

                    // throw new NotFoundFailure(
                    //   "El usuario no existe en la base de datos."
                    // );
                  }

                  // If user is a valid WtUser, return it with updated 'emailVerified' property.
                  return { ...user, emailVerified: firebaseUser.emailVerified };
                })
              )
          : of(null);
      })
    );
  }

  /**
   * Patches company in state and in localstorage.
   *
   * @param company
   */
  patchCompany(company: WtCompany | null): void {
    this.companyService.saveToLocalStorage(company);
    this.store.patch({ company: company });
  }

  /**
   * Patches license in state and in localstorage.
   *
   * @param license
   */
  patchLicense(license: WtLicense | null): void {
    this.licenseService.saveToLocalStorage(license);
    this.store.patch({ license: license });
  }

  /**
   * Patches user in state and in localstorage.
   *
   * @param user Partial of WtUser or null.
   * @param patchLocalStorage boolean indicating if localsotrage should be patched. Default true.
   * @param patchDb boolean indicating if Firestore should be patched. Default false.
   * @throws {FirestoreFailure} if User document update fails.
   * @returns
   */
  async patchUser(
    user: Partial<WtUser> | null,
    patchLocalStorage: boolean = true,
    patchDb: boolean = false
  ): Promise<void> {
    const mergedUser = user ? { ...this.store.state.user, ...user } : null;

    if (patchDb && user) {
      await this.firebase.update(`${USERS_FB_COLLECTION}/${mergedUser.id}`, {
        fullName: mergedUser.fullName,
        docType: mergedUser.docType,
        docNumber: mergedUser.docNumber,
        genero: mergedUser.genero,
        fNacimiento: mergedUser.fNacimiento,
        movil: mergedUser.movil,
        /**
         * @dev Do not update "photo" in Firestore. LocalStorage photo is a base64 string.
         */
        activo: mergedUser.activo,
        firstReport: !!mergedUser.firstReport,
      });
    }

    if (patchLocalStorage) {
      // Photo is saved in localstorage as a base64 string.
      const photo = mergedUser ? mergedUser.photo : null;
      if (photo && photo.startsWith("https://firebasestorage")) {
        const photoDataUrl = await this.firebase
          .downloadStringFromStorage(mergedUser.photo)
          .catch((e) => "");
        mergedUser.photo = photoDataUrl;
      }
      this.saveUserToLocalStorage(mergedUser);
    }
    this.store.patch({ user: mergedUser });
    return;
  }

  /**
   * Patches error in state.
   *
   * @param error
   */
  patchError(error: Failure | null): void {
    this.store.patch({ error: error });
  }

  /**
   * Uploads photo to storage and updates user photo in state and database.
   *
   * @param photo {Photo} object with dataUrl to upload.
   * @throws {StorageFailure} if photo upload fails.
   * @throws {FirestoreFailure} if User document update fails.
   */
  async updateUserPhoto(photo: Photo): Promise<void> {
    const downloadUrl = await this.firebase.uploadPhotoToStorage(
      photo,
      `${USERS_FB_COLLECTION}/${this.store.state.user?.id}/profile`,
      `${this.store.state.user?.id}_profile_photo`
    );

    await this.patchUser({ photo: downloadUrl }, true);
    return;
  }

  /**
   * watches authState changes to load user, license and company. If authState is null, tries to
   * retrieve authenticated user from local storage.
   *
   * @returns Promise<void> Nothing is returned. User, License and Company must be obtained using
   * UserService getters. keep it inmutable!
   */
  private async retrieveAuthenticatedUser(): Promise<void> {
    // Watch auth state for changes to update user.
    this.sbs.push(
      // Authstate observer is only triggered on sign-in, sign-out, or first load. Will be available
      // even when device is offline for an already authenticated user.
      this.firebase.authState
        .pipe(
          catchError((e) => {
            // Transform Firebase Auth errors into app Failures.
            const failure = FailureUtils.errorToFailure(e);
            throw failure;
          }),
          switchMap((firebaseUser: FirebaseUser | null) => {
            // If authState returns null means that there is no session open. If session is open,
            // FirebaseUser is returned even when device is offline.
            if (!firebaseUser) {
              return of(null);
              /**
               * @dev Do not throw Failures here because it will cause the app to fail when user sings out.
               */
            }

            // Retrieve user from database, to get the latest data. Returns 'undefined' if document
            // doesn't exist or if there is a network error.
            return this.firebase
              .doc$<WtUser>(`${USERS_FB_COLLECTION}/${firebaseUser.uid}`)
              .pipe(
                catchError((e) => {
                  // Transform Firestore errors into app Failures.
                  const failure = FailureUtils.errorToFailure(e);
                  throw failure;
                }),
                distinctUntilChanged((prev, curr) => prev.id === curr.id), // Avoid duplicated emissions.
                map((user) => {
                  // If returned user is undefined, check if user in localstoage is same as user returned
                  // by authentication and return it. Otherwise clean localStorage user and return undefined.
                  if (!user) {
                    const localstorageUser = this.fetchUserFromLocalStorage();
                    if (
                      localstorageUser &&
                      localstorageUser.id === firebaseUser.uid
                    ) {
                      return localstorageUser;
                    }

                    if (localstorageUser) {
                      this.saveUserToLocalStorage(null);
                    }
                    return user;
                  }

                  // If user is a valid WtUser, return it with updated 'emailVerified' property.
                  return {
                    ...user,
                    emailVerified: firebaseUser.emailVerified,
                  };
                })
              );
          }),
          withLatestFrom(this.online),
          map(([user, online]: [null | WtUser | undefined, boolean]) => {
            // If user is undefined, could be a network error, so check if device is online.
            if (user === undefined && !online) {
              throw new NoNetworkFailure("No hay conexión a internet");
            }

            // If user is null, there is no session open.
            // If user is undefined, user exists in Firebase Auth but not in Firestore.
            // If user is a valid User, its ok.
            // Either case user must be patched to state.
            return user ? user : null;
          }),
          tap({
            next: async (user: WtUser | null) => {
              await this.patchUser(user);
            },
            error: async (e) => {
              if (
                e instanceof UnauthenticatedFailure ||
                e instanceof NotFoundFailure
              ) {
                this.patchError(e);
                await this.patchUser(null);
                return;

                // Otherwise, just console log error if in development mode.
              } else {
                this.patchError(e);
                if (!environment.production) {
                  console.groupCollapsed(`🏹 [UserService error]`);
                  console.log(
                    "Ocurrió un error al intentar obtener el usuario autenticado."
                  );
                  console.log("error", e);
                  console.groupEnd();
                }
              }
            },
          }),
          catchError((e) => of())
        )
        .subscribe()
    );
  }

  /**
   * Retrieves the active license for current authenticated user. First, tries to retrieve it from
   * localStorage. If fails, retrieves it from the database. If fails, throws a Failure.
   *
   * @returns Promise<void> No license is returned. License must be obtained using UserService.license
   * getter. keep it inmutable!
   * @throws FirestoreFailure, or LicenseFailure if not license was found.
   * @dev Cuando se recupera la licencia desde el localStorage, sería sano hacer la verificación
   * contra la licencia real, para evitar abusos. Se deja para el futuro.
   */
  public async retrieveActiveLicense(): Promise<void> {
    try {
      // Try to retrieve license from database. If offline, licenses will be empty.
      const licenses = await this.firebase.fetchCollection<WtLicense>(
        LICENCES_FB_COLLECTION,
        [
          where("wtUserId", "==", this.currentUser.id),
          where("ends", ">=", new Date()),
          orderBy("ends", "desc"),
          limit(1),
        ]
      );

      // If license was found, patch it in state.
      if (licenses.length > 0) {
        this.patchLicense(licenses[0]);
        return;
      }

      // If no license was found, check if device if online to be shure it was not found.
      const online = await this.online.pipe(take(1)).toPromise();
      if (online) {
        this.patchCompany(null);
        throw new NotFoundFailure(
          "No se encontró una licencia activa (online)."
        );
      }

      // If device is offline, try to retrieve license from local storage.
      const localStorageLicense = this.licenseService.fetchFromLocalStorage();

      // If license was found in LocalStorage, check if active and patch it in state
      if (localStorageLicense) {
        const now = new Date().getTime();
        const ends = (localStorageLicense.ends as Timestamp).toDate().getTime();
        if (ends >= now) {
          this.patchLicense(localStorageLicense);
          return;
        }
      }

      // If no license was found, set license null and se error.
      this.patchLicense(null);
      throw new NotFoundFailure(
        "No se encontró una licencia activa (offline)."
      );
    } catch (e: unknown) {
      const f = FailureUtils.errorToFailure(e);
      throw f;
    }
  }

  /**
   * Signs user in with email and password.
   *
   * @param email
   * @param password
   * @returns
   */
  public async emailPasswordLogin(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return this.firebase.emailPasswordLogin(email, password);
  }

  /**
   * Checks if user already exists in database. If it doesn't, creates it from recieved WtUser object.
   *
   * @param user
   * @returns
   */
  public async createUser(user: WtUser): Promise<void> {
    const docPath = `${USERS_FB_COLLECTION}/${user.id}`;
    const userExists = await this.firebase
      .fetchDoc(docPath)
      .then((doc) => !!doc)
      .catch((e) => null);
    if (!userExists) {
      return this.firebase.set(docPath, user);
    }
  }

  /**
   * Signs out current user and updates state.
   */
  public async signOut(): Promise<void> {
    await this.firebase.signOut();
    await this.patchUser(null);
    this.patchLicense(null);
    this.patchCompany(null);
  }

  /**
   * Sends email verification to authenticated user.
   *
   * @returns
   */
  async sendEmailVerification(): Promise<void> {
    return this.firebase.sendEmailVerification();
  }

  /**
   * Retrieves the "Company" for current authenticated user. First, tries to retrieve it from
   * localStorage. If that fails, retrieves it from database. If that fails, throws a Failure.
   *
   * @returns Promise<void> No Company is returned. Company must be obtained using UserService.company
   * getter. keep it inmutable!
   * @throws FirestoreFailure, CompanyFailure if no Company is found, or LicenseFailure if no License
   * is found.
   */
  public async retrieveUserCompany(): Promise<void> {
    try {
      // Try to retrieve company from database. If offline, company will be undefined.
      let company = await this.firebase
        .fetchDoc<WtCompany>(
          `${COMPANYS_FB_COLLECTION}/${this.store.state.license.wtCompanyId}`
        )
        .catch((e) => {
          const f = FailureUtils.errorToFailure(e);
          if (f instanceof NoNetworkFailure) {
            return undefined;
          }
        });

      // If company was found, try to download logo and patch it in state.
      if (company) {
        const photo = await this.firebase
          .downloadStringFromStorage(
            `fotoPerfilUser/${this.store.state.license.wtCompanyId}`
          )
          .catch((e) => "");
        this.patchCompany({ ...company, photo });
        return;
      }

      // If no license was found, check if device if online to be shure it was not found.
      const online = await this.online.pipe(take(1)).toPromise();
      if (online) {
        this.patchCompany(null);
        throw new NotFoundFailure(
          "No se encontró la Compañía del Usuario (online)."
        );
      }

      // If device is offline, try to retrieve company from local storage.
      const localStorageCompany = this.companyService.fetchFromLocalStorage();

      // If company was found in LocalStorage, patch it in state.
      if (localStorageCompany) {
        this.patchCompany(localStorageCompany);
        return;
      }

      this.patchCompany(null);
      throw new NotFoundFailure(
        "No se encontró la Compañía del Usuario (offline)."
      );
    } catch (e: unknown) {
      const f = FailureUtils.errorToFailure(e);
      throw f;
    }
  }

  /**
   * Saves a User to the current authenticated user in localStorage.
   *
   * @param report
   */
  private saveUserToLocalStorage(user: WtUser | null): void {
    const userToBeSaved = user ? this.userToLocalStorage(user) : null;
    this.localStorage.save<LocalStorageWtUser>(
      CURRENT_USER_LS_KEY,
      userToBeSaved
    );
  }

  /**
   * Retrieves authenticated User from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  private fetchUserFromLocalStorage(): WtUser | null {
    const localStorageUser = this.userFromLocalStorage(
      this.localStorage.fetch<WtUser>(CURRENT_USER_LS_KEY)
    );
    return this.userFromLocalStorage(localStorageUser);
  }

  /**
   * Transforms WtUser to localStorage apporpriate format.
   *
   * @param report
   * @returns
   */
  private userToLocalStorage(user: WtUser): LocalStorageWtUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      docType: user.docType,
      docNumber: user.docNumber,
      emailVerified: user.emailVerified,
      genero: user.genero,
      fNacimiento:
        user.fNacimiento &&
        user.fNacimiento.nanoseconds &&
        user.fNacimiento.seconds
          ? user.fNacimiento
          : null,
      movil: user.movil,
      devices: user.devices,
      photo: user.photo,
      activo: user.activo,
      firstReport: user.firstReport,
    };
  }

  /**
   * Transforms a LocaStorageWtUser from localStorage to apporpriate WtUser format.
   *
   * @param localStorageWtReport
   * @returns WtReport | null
   */
  private userFromLocalStorage(
    localStorageUser: LocalStorageWtUser | null
  ): WtUser | null {
    return localStorageUser
      ? {
          id: localStorageUser.id,
          email: localStorageUser.email,
          fullName: localStorageUser.fullName,
          docType: localStorageUser.docType,
          docNumber: localStorageUser.docNumber,
          emailVerified: localStorageUser.emailVerified,
          genero: localStorageUser.genero,
          fNacimiento:
            localStorageUser.fNacimiento &&
            localStorageUser.fNacimiento.seconds &&
            localStorageUser.fNacimiento.nanoseconds
              ? new Timestamp(
                  localStorageUser.fNacimiento.seconds,
                  localStorageUser.fNacimiento.nanoseconds
                )
              : null,
          movil: localStorageUser.movil,
          devices: localStorageUser.devices,
          photo: localStorageUser.photo,
          activo: localStorageUser.activo,
          firstReport: localStorageUser.firstReport,
        }
      : null;
  }
}
