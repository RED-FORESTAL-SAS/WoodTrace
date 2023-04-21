import { Injectable, OnDestroy, Optional } from "@angular/core";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { User } from "../models/user.model";
import { CURRENT_USER_LS_KEY } from "../constants/current-user-ls-key.constant";
import { UserStore } from "../state/user.store";
import { WtCompany } from "../models/wt-company";
import { of, Observable, Subscription } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { WtLicense } from "../models/wt-license";
import { LicenseFailure, LicenseService } from "./license.service";
import { CompanyFailure, CompanyService } from "./company.service";
import { FirebaseService } from "./firebase.service";
import { Timestamp } from "../types/timestamp.type";
import { limit, orderBy, where } from "../types/query-constraint.type";
import { LICENCES_FB_COLLECTION } from "../constants/licenses-fb-collection";
import { Failure, FailureUtils } from "../utils/failure.utils";
import { COMPANYS_FB_COLLECTION } from "../constants/compays-fb-collection";
import { Auth, authState, User as FirebaseUser } from "@angular/fire/auth";
import { USERS_FB_COLLECTION } from "../constants/users-fb-collection";
import { WtUser } from "../models/wt-user";

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
    // Watch auth state to load user, license and company.
    this.sbs.push(
      authState(this.auth)
        .pipe(
          switchMap((firebaseUser: FirebaseUser | null) =>
            firebaseUser !== null
              ? this.firebase
                  .doc$(`${USERS_FB_COLLECTION}/${firebaseUser.uid}`)
                  .pipe(
                    map((user: WtUser | undefined) => {
                      // If user doesn't exist in user collection, fail.
                      if (user === undefined) {
                        throw new UserFailure(
                          "El usuario no existe en la base de datos."
                        );
                      }
                      return {
                        ...user,
                        emailVerified: firebaseUser.emailVerified,
                      };
                    })
                  )
              : of(null)
          ),
          tap({
            next: async (user: WtUser | null) => {
              if (user) {
                try {
                  /**
                   * @todo @mario retrieve current user.
                   */
                  await this.retrieveActiveLicense();
                  await this.retrieveUserCompany();
                } catch (e) {
                  /**
                   * @dev Fail silently.
                   */
                }
              }
            },
          })
        )
        .subscribe()
    );
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
  get user(): Observable<User | null> {
    return this.store.state$.pipe(map((state) => state.user));
  }

  /**
   * Returns the current authenticated user from state.
   *
   * @returns
   */
  get currentUser(): User | null {
    return this.store.state.user;
  }

  patchCompany(company: WtCompany | null): void {
    this.companyService.saveToLocalStorage(company);
    this.store.patch({ company: company });
  }

  patchLicense(license: WtLicense | null): void {
    this.licenseService.saveToLocalStorage(license);
    this.store.patch({ license: license });
  }

  patchUser(user: User | null): void {
    this.saveUserToLocalStorage(user);
    this.store.patch({ user: user });
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

    // If license is found and it's valid, patch state.
    if (license) {
      const now = new Date().getTime();
      const ends = (license.ends as Timestamp).toDate().getTime();
      if (ends <= now) {
        this.patchLicense(license);
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
        this.patchLicense(licenses[0]);
        return;
      })
      .catch((e) => {
        if (e instanceof LicenseFailure) throw e;
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
      this.patchCompany(company);
      return;
    }

    // Otherwise, query the database for User's Company.

    if (this.store.state.license) {
      throw new LicenseFailure(
        "No se cargó la Compañía, porque el no se encontró una Licencia activa para el Usuario autenticado."
      );
    }

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
        this.patchCompany(company);
      })
      .catch((e) => {
        if (e instanceof CompanyFailure) throw e;
        const failure = FailureUtils.errorToFailure(e);
        throw failure;
      });
  }

  /**
   * Saves a User to the current authenticated user in localStorage.
   *
   * @param report
   */
  private saveUserToLocalStorage(report: User | null): void {
    const userToBeSaved = report ? this.userToLocalStorage(report) : null;
    this.localStorage.save<User>(CURRENT_USER_LS_KEY, userToBeSaved);
  }

  /**
   * Retrieves authenticated User from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  private fetchUserFromLocalStorage(): User | null {
    const localStorageUser = this.userFromLocalStorage(
      this.localStorage.fetch<User>(CURRENT_USER_LS_KEY)
    );
    return this.userFromLocalStorage(localStorageUser);
  }

  /**
   * Transforms WtUser to localStorage apporpriate format.
   *
   * @param report
   * @returns
   */
  private userToLocalStorage(user: User): User {
    return user;
    /**
     * @dev Si bien este código aparenta no hace nada, con esto se respeta la estructura definida
     * para los servicios. No se hace la conversión, simplemente porque el user es el mismo en todas
     * partes.
     */
  }

  /**
   * Transforms a "User" from localStorage to apporpriate WtUser format.
   *
   * @param localStorageWtReport
   * @returns WtReport | null
   */
  private userFromLocalStorage(localStorageUser: User | null): User | null {
    return localStorageUser ? localStorageUser : null;
    /**
     * @dev Si bien este código aparenta no hace nada, con esto se respeta la estructura definida
     * para los servicios. No se hace la conversión, simplemente porque el user es el mismo en todas
     * partes.
     */
  }
}
