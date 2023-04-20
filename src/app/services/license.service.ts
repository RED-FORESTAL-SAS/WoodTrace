import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { LocaStorageWtLicense, WtLicense } from "../models/wt-license";
import { LICENCES_FB_COLLECTION } from "../constants/licenses-fb-collection";
import { limit, orderBy, where } from "../types/query-constraint.type";
import { ACTIVE_LICENSE_LS_KEY } from "../constants/active-license-ls-key.constant";
import { Failure, FailureUtils } from "../utils/failure.utils";
import { Timestamp } from "../types/timestamp.type";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { UserService } from "./user.service";

/** Failure for License Domain. */
export class LicenseFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class LicenseService {
  constructor(
    private firebase: FirebaseService,
    private localStorage: LocalStorageRepository,
    private userService: UserService
  ) {}

  /**
   * Retrieves the active license for current authenticated user. First, tries to retrieve it from
   * localStorage. If fails, retrieves it from the database. If fails, throws a Failure.
   *
   * @returns Promise<WtLicense> A promise with a valid WtLicense.
   * @throws FirestoreFailure, or LicenseFailure if not license was found.
   * @dev Cuando se recupera la licencia desde el localStorage, sería sano hacer la verificación
   * contra la licencia real, para evitar abusos. Se deja para el futuro.
   */
  async retrieveActiveLicense(): Promise<WtLicense> {
    // Try to retrieve license from local storage.
    const license = this.fetchFromLocalStorage();

    // If license is found, check if it's still valid.
    if (license) {
      const now = new Date().getTime();
      const ends = (license.ends as Timestamp).toDate().getTime();
      if (ends <= now) return license;
    }

    // Otherwise, query the database for an active license.
    return this.firebase
      .fetchCollection<WtLicense>(LICENCES_FB_COLLECTION, [
        where("wtUserId", "==", this.userService.currentUser.id),
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

        // If license was found, save it to local storage for future use and return it.
        this.saveToLocalStorage(licenses[0]);
        return licenses[0];
      })
      .catch((e) => {
        if (e instanceof LicenseFailure) throw e;
        const failure = FailureUtils.errorToFailure(e);
        throw failure;
      });
  }

  /**
   * Saves a WtLicense to localStorage.
   *
   * @param license
   */
  saveToLocalStorage(license: WtLicense | null): void {
    const licenceToBeSaved = license ? this.toLocalStorage(license) : null;
    this.localStorage.save<LocaStorageWtLicense>(
      ACTIVE_LICENSE_LS_KEY,
      licenceToBeSaved
    );
  }

  /**
   * Retrieves WtLicense from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  fetchFromLocalStorage(): WtLicense | null {
    const localStorageLicense = this.localStorage.fetch<LocaStorageWtLicense>(
      ACTIVE_LICENSE_LS_KEY
    );
    return this.fromLocalStorage(localStorageLicense);
  }

  /**
   * Transforms WtLicense to localStorage apporpriate format (avoid losing Timestamps).
   *
   * @param license
   */
  toLocalStorage(license: WtLicense): LocaStorageWtLicense {
    return {
      id: license.id,
      status: license.status,
      entidadId: license.entidadId,
      wtUserId: license.wtUserId,
      begins: {
        seconds: (license.begins as Timestamp).seconds,
        nanoseconds: (license.begins as Timestamp).nanoseconds,
      },
      ends: {
        seconds: (license.ends as Timestamp).seconds,
        nanoseconds: (license.ends as Timestamp).nanoseconds,
      },
      redeemCode: license.redeemCode,
    };
  }

  /**
   * Transforms a LocaStorageWtLicense from localStorage to apporpriate WtLicense format
   * (reconstruct Timestamps).
   *
   * @param localStorageWtLicense to be transformed to WtLicense.
   * @returns
   */
  fromLocalStorage(
    localStorageWtLicense: LocaStorageWtLicense | null
  ): WtLicense | null {
    return localStorageWtLicense
      ? {
          id: localStorageWtLicense.id,
          status: localStorageWtLicense.status,
          entidadId: localStorageWtLicense.entidadId,
          wtUserId: localStorageWtLicense.wtUserId,
          begins: new Timestamp(
            localStorageWtLicense.begins.seconds,
            localStorageWtLicense.begins.nanoseconds
          ),
          ends: new Timestamp(
            localStorageWtLicense.ends.seconds,
            localStorageWtLicense.ends.nanoseconds
          ),
          redeemCode: localStorageWtLicense.redeemCode,
        }
      : null;
  }
}
