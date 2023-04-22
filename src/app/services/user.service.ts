import { Injectable, OnDestroy, Optional } from "@angular/core";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { CURRENT_USER_LS_KEY } from "../constants/current-user-ls-key.constant";
import { UserStore } from "../state/user.store";
import { WtCompany } from "../models/wt-company";
import { Observable, Subscription } from "rxjs";
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
import { Auth, authState, User as FirebaseUser } from "@angular/fire/auth";
import { USERS_FB_COLLECTION } from "../constants/users-fb-collection";
import { LocalStorageWtUser, WtUser } from "../models/wt-user";
import { environment } from "src/environments/environment";

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
   * Returns the current authenticated user from state.
   *
   * @returns
   */
  get currentUser(): WtUser | null {
    return this.store.state.user;
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
   * @param user
   */
  patchUser(user: WtUser | null): void {
    this.saveUserToLocalStorage(user);
    this.store.patch({ user: user });
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
      this.patchUser(user);
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
                this.patchUser(user);
              }
            },
            error: (e) => {
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
                this.patchUser(null);
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
          })
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
  private saveUserToLocalStorage(report: WtUser | null): void {
    const userToBeSaved = report ? this.userToLocalStorage(report) : null;
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
      fNacimiento: user.fNacimiento,
      movil: user.movil,
      devices: user.devices,
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
          fNacimiento: new Timestamp(
            localStorageUser.fNacimiento.seconds,
            localStorageUser.fNacimiento.nanoseconds
          ),
          movil: localStorageUser.movil,
          devices: localStorageUser.devices,
        }
      : null;
  }
}
