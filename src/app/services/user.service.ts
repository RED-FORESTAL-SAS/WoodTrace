import { Injectable, OnDestroy, Optional } from "@angular/core";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { CURRENT_USER_LS_KEY } from "../constants/current-user-ls-key.constant";
import { UserStore } from "../state/user.store";
import { WtCompany } from "../models/wt-company";
import { Observable, Subscription, of } from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { WtLicense } from "../models/wt-license";
import { LicenseFailure, LicenseService } from "./license.service";
import { CompanyFailure, CompanyService } from "./company.service";
import { FirebaseService } from "./firebase.service";
import { Timestamp } from "../types/timestamp.type";
import { limit, orderBy, where } from "../types/query-constraint.type";
import { LICENCES_FB_COLLECTION } from "../constants/licenses-fb-collection";
import {
  AuthNetworkRequestFailedFailure,
  Failure,
  FailureUtils,
  NoNetworkFailure,
  NotFoundFailure,
  UnauthenticatedFailure,
} from "../utils/failure.utils";
import { COMPANYS_FB_COLLECTION } from "../constants/compays-fb-collection";
import {
  Auth,
  authState,
  signOut,
  User as FirebaseUser,
} from "@angular/fire/auth";
import { USERS_FB_COLLECTION } from "../constants/users-fb-collection";
import { LocalStorageWtUser, WtUser } from "../models/wt-user";
import { environment } from "src/environments/environment";
import { Photo } from "./camera.service";
import { NetworkRepository } from "../infrastructure/network.repository";

export class UserFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class UserService implements OnDestroy {
  private sbs: Subscription[] = [];

  constructor(
    @Optional() private auth: Auth,
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
        .pipe(distinctUntilChanged((prev, curr) => prev?.id === curr?.id))
        .subscribe((license: WtLicense) => {
          if (license) {
            this.retrieveUserCompany().catch((e) => {
              /**
               * @todo @mario Mostrar los errores como debe ser.
               */
            });
          } else {
            this.patchCompany(null);
          }
        }),

      // Watch for changes in User and retrieve/clean License.
      this.user
        .pipe(distinctUntilChanged((prev, curr) => prev?.id === curr?.id))
        .subscribe((user: WtUser | null) => {
          if (user) {
            this.retrieveActiveLicense().catch((e) => {
              /**
               * @todo @mario Mostrar los errores como debe ser.
               */
            });
          } else {
            this.patchLicense(null);
          }
        })
    );

    /**
     * @todo @mario ver si al subir esto de primero, se evita que se pueblen los otros valores nulos.
     * Deberia ser irrelevante. Tambien podríamos hacer un skip null.
     */
    // Retrieve authenticated user and watch for changes in authState.
    this.retrieveAuthenticatedUser();
  }

  ngOnDestroy(): void {
    console.log("Running UserService OnDestroy");
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
   * Returns photo of current authenticated user from state.
   *
   * @todo @mario Cargar en el localstorage la foto de perfil en formato base64, para que pueda
   * cargarse en el perfil cuando no haya internet. En el profile.page.html también hay que cambiar
   * el src de la imagen para que cargue desde el localstorage.
   */
  get userPhotoDataUrl(): Observable<string | null> {
    return this.store.state$.pipe(map((state) => state.userPhotoPath));
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
   * @throws {FirestoreFailure} if User document update fails.
   * @returns
   */
  async patchUser(
    user: Partial<WtUser> | null,
    patchDb: boolean = false
  ): Promise<void> {
    const mergedUser = user ? { ...this.store.state.user, ...user } : null;

    if (patchDb && user) {
      console.log("Update Data");
      console.log({
        fullName: mergedUser.fullName,
        docType: mergedUser.docType,
        docNumber: mergedUser.docNumber,
        genero: mergedUser.genero,
        fNacimiento: mergedUser.fNacimiento,
        movil: mergedUser.movil,
        photo: mergedUser.photo,
        activo: mergedUser.activo,
        firstReport: mergedUser.firstReport,
      });

      await this.firebase.update(`${USERS_FB_COLLECTION}/${mergedUser.id}`, {
        fullName: mergedUser.fullName,
        docType: mergedUser.docType,
        docNumber: mergedUser.docNumber,
        genero: mergedUser.genero,
        fNacimiento: mergedUser.fNacimiento,
        movil: mergedUser.movil,
        photo: mergedUser.photo,
        activo: mergedUser.activo,
        firstReport: !!mergedUser.firstReport,
      });
    }

    this.saveUserToLocalStorage(mergedUser);
    this.store.patch({ user: mergedUser });
    return;
  }

  /**
   * Uploads photo to storage and updates user photo in state and database.
   *
   * @param photo {Photo} object with dataUrl to upload.
   * @throws {StorageFailure} if photo upload fails.
   * @throws {FirestoreFailure} if User document update fails.
   */
  async updateUserPhoto(photo: Photo): Promise<void> {
    const downloadUrl = await this.firebase.uploadStringToStorage(
      photo,
      `${USERS_FB_COLLECTION}/${this.store.state.user?.id}/profile`,
      `${this.store.state.user?.id}_profile_photo`
    );
    await this.patchUser({ photo: downloadUrl }, true);
    return;
  }

  /**
   * Retrieves the authenticated user from local storage, their license and company from localstorage and watches
   * authState changes to load user, license and company, when authstate changes.
   *
   * @returns Promise<void> Nothing is returned. User, License and Company must be obtained using
   * UserService getters. keep it inmutable!
   */
  public async retrieveAuthenticatedUser(): Promise<void> {
    // Try to retrieve user from local storage.
    const user = this.fetchUserFromLocalStorage();

    // If found user is differente from state, patch it in state.
    if (user && user.id !== this.store.state.user?.id) {
      await this.patchUser(user);
    }

    // Watch auth state for changes to update user.
    this.sbs.push(
      authState(this.auth) // The observer is only triggered on sign-in or sign-out!
        .pipe(
          catchError((e) => {
            // Transform Firebase Auth errors into app Failures.
            const failure = FailureUtils.errorToFailure(e);
            throw failure;
          }),
          switchMap((firebaseUser: FirebaseUser | null) => {
            // If authState didn't return a user, fail.
            if (!firebaseUser) {
              /**
               * @todo @mario Definir si es neceario este error. Genera que al hacer logout, se
               * muestre un error.
               */
              throw new UnauthenticatedFailure("Usuario no autenticado.");
            }

            // Retrieve user from database, to get the latest data.
            return this.firebase
              .doc$<WtUser>(`${USERS_FB_COLLECTION}/${firebaseUser.uid}`)
              .pipe(
                catchError((e) => {
                  // Transform Firestore errors into app Failures.
                  const failure = FailureUtils.errorToFailure(e);
                  throw failure;
                }),
                distinctUntilChanged((prev, curr) => prev.id === curr.id), // Avoid duplicated emissions.
                map((user: WtUser | undefined) => {
                  // If user was not found, fail.
                  if (!user) {
                    throw new NotFoundFailure("Usuario no encontrado.");
                  }

                  // Otherwise, return user with emailVerified flag.
                  return {
                    ...user,
                    emailVerified: firebaseUser.emailVerified,
                  };
                })
              );
          }),
          tap({
            next: async (user: WtUser | null) => {
              // If found user is differente from state, patch it in state.
              if (user && user.id !== this.store.state.user?.id) {
                await this.patchUser(user);
              }
            },
            error: async (e) => {
              console.log("error", e);

              // If device is offline, do not change state and fail silently.
              if (
                e instanceof AuthNetworkRequestFailedFailure ||
                e instanceof NoNetworkFailure
              ) {
                return;

                // If user is unauthenticated or not found, clean user.
              } else if (
                e instanceof UnauthenticatedFailure ||
                e instanceof NotFoundFailure
              ) {
                await this.patchUser(null);
                return;

                // Otherwise, just console log error if in development mode.
              } else {
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
    // Try to retrieve license from local storage.
    const license = this.licenseService.fetchFromLocalStorage();

    // If license is found in LocalStorage.
    if (license) {
      const now = new Date().getTime();
      const ends = (license.ends as Timestamp).toDate().getTime();

      // If active, path it in state and exit.
      if (ends <= now) {
        if (license.id !== this.store.state.license?.id) {
          this.patchLicense(license);
        }
        return;
      }
    }

    // Otherwise, query the database for an active license.
    this.firebase
      .fetchCollection<WtLicense>(LICENCES_FB_COLLECTION, [
        where("wtUserId", "==", this.currentUser.id),
        where("ends", ">=", new Date()),
        orderBy("ends", "desc"),
        limit(1),
      ])
      .then((licenses) => {
        if (licenses.length === 0) {
          throw new LicenseFailure(
            "No se encontró una licencia activa para el usuario actual."
          );
        }

        // If license was found, patch state.
        if (licenses[0].id !== this.store.state.license?.id) {
          this.patchLicense(licenses[0]);
        }
      })
      .catch((e) => {
        // If not found or error, clean license from state.
        if (this.store.state.license !== null) this.patchLicense(null);

        // Throw Failures.
        const failure = FailureUtils.errorToFailure(e);
        throw failure;
      });
  }

  /**
   * Signs out current user and updates state.
   */
  public async signOut(): Promise<void> {
    await signOut(this.auth).catch((e) => {});
    await this.patchUser(null);
    this.patchLicense(null);
    this.patchCompany(null);
  }

  /**
   * Retrieves the "Company" for current authenticated user. First, tries to retrieve it from
   * localStorage. If fails, retrieves it from the database. If fails, throws a Failure.
   *
   * @returns Promise<void> No Company is returned. Company must be obtained using UserService.company
   * getter. keep it inmutable!
   * @throws FirestoreFailure, CompanyFailure if no Company is found, or LicenseFailure if no License
   * is found.
   */
  public async retrieveUserCompany(): Promise<void> {
    // Try to retrieve license from local storage.
    const company = this.companyService.fetchFromLocalStorage();

    // If company is found and it's valid, patch state.
    if (company) {
      if (
        company.numerodocumento !== this.store.state.company?.numerodocumento
      ) {
        this.patchCompany(company);
      }
      return;
    }

    // If there's no license, fail.
    if (!this.store.state.license) {
      throw new LicenseFailure(
        "No se cargó la Compañía, porque el no se encontró una Licencia activa para el Usuario autenticado."
      );
    }

    // Otherwise, query the database for User's Company.
    this.firebase
      .fetchDoc<WtCompany>(
        `${COMPANYS_FB_COLLECTION}/${this.store.state.license.wtCompanyId}`
      )
      .then((company) => {
        if (!company) {
          throw new CompanyFailure(
            "No se encontró una Compañía para el Usuario autenticado."
          );
        }

        // If company was found, patch state.
        if (
          company.numerodocumento !== this.store.state.company?.numerodocumento
        ) {
          this.patchCompany(company);
        }
      })
      .catch((e) => {
        // If not found or error, clean license from state.
        if (this.store.state.company) this.patchCompany(null);

        // Throw Failures.
        const failure = FailureUtils.errorToFailure(e);
        throw failure;
      });
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
