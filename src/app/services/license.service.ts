import { Injectable } from "@angular/core";
import { LocaStorageWtLicense, WtLicense } from "../models/wt-license";
import { ACTIVE_LICENSE_LS_KEY } from "../constants/active-license-ls-key.constant";
import { Failure } from "../utils/failure.utils";
import { Timestamp } from "../types/timestamp.type";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";

/** Failure for License Domain. */
export class LicenseFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class LicenseService {
  constructor(private localStorage: LocalStorageRepository) {}

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
      wtCompanyId: license.wtCompanyId,
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
          wtCompanyId: localStorageWtLicense.wtCompanyId,
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
