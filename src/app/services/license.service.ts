import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { UtilsService } from "./utils.service";
import { LocastorageWtLicense, WtLicense } from "../models/wt-license";
import { LICENCES_FB_COLLECTION } from "../constants/licenses-fb-collection";
import { limit, orderBy, where } from "../types/query-constraint.type";
import { ACTIVE_LICENSE_LS_KEY } from "../constants/active-license-ls-key.constant";
import { Failure, FailureUtils } from "../utils/failure.utils";
import { Timestamp } from "../types/timestamp.type";

/** Failure for License Domain. */
export class LicenseFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class LicenseService {
  constructor(private firebase: FirebaseService, private utils: UtilsService) {}

  /**
   * Retrieves the active license for current authenticated user. First, tries to retrieve it from
   * localstorage. If fails, retrieves it from the database. If fails, throws a Failure.
   *
   * @returns Promise<WtLicense> A promise with a valid WtLicense.
   * @throws FirestoreFailure, or LicenseFailure if not license was found.
   * @dev Cuando se recupera la licencia desde el localstorage, sería sano hacer la verificación
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
    const user = this.utils.getCurrentUser();
    return this.firebase
      .fetchCollection<WtLicense>(LICENCES_FB_COLLECTION, [
        where("wtUserId", "==", user.id),
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
   * Saves a WtLicense to localstorage.
   *
   * @param license
   */
  saveToLocalStorage(license: WtLicense): void {
    const licenceToBeSaved = this.toLocalStorage(license);
    this.utils.saveLocalStorage(ACTIVE_LICENSE_LS_KEY, licenceToBeSaved);
  }

  /**
   * Retrieves a WtLicense from localstorage
   * @returns
   */
  fetchFromLocalStorage(): WtLicense | null {
    const localstorageLicense = this.utils.getFromLocalStorage(
      ACTIVE_LICENSE_LS_KEY
    ) as LocastorageWtLicense | null;

    return this.fromLocalStorage(localstorageLicense);
  }

  /**
   * Transforms WtLicense to localstorage apporpriate format (avoid losing Timestamps).
   *
   * @param license
   */
  toLocalStorage(license: WtLicense): LocastorageWtLicense {
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
   * Transforms a LocastorageWtLicense from localstorage to apporpriate WtLicense format
   * (reconstruct Timestamps).
   *
   * @param localstorageWtLicense to be transformed to WtLicense.
   * @returns
   */
  fromLocalStorage(
    localstorageWtLicense: LocastorageWtLicense | null
  ): WtLicense | null {
    return localstorageWtLicense
      ? {
          id: localstorageWtLicense.id,
          status: localstorageWtLicense.status,
          entidadId: localstorageWtLicense.entidadId,
          wtUserId: localstorageWtLicense.wtUserId,
          begins: new Timestamp(
            localstorageWtLicense.begins.seconds,
            localstorageWtLicense.begins.nanoseconds
          ),
          ends: new Timestamp(
            localstorageWtLicense.ends.seconds,
            localstorageWtLicense.ends.nanoseconds
          ),
          redeemCode: localstorageWtLicense.redeemCode,
        }
      : null;
  }
}
