import { Injectable } from "@angular/core";
import { LocaStorageWtCompany, WtCompany } from "../models/wt-company";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { USER_COMPANY_LS_KEY } from "../constants/user-company-ls-key.constant";
import { Failure } from "../utils/failure.utils";

/**
 * Failure for Company Domain.
 */
export class CompanyFailure extends Failure {}

@Injectable({
  providedIn: "root",
})
export class CompanyService {
  constructor(private localStorage: LocalStorageRepository) {}

  /**
   * Saves a WtCompany to localStorage.
   *
   * @param company
   */
  public saveToLocalStorage(company: WtCompany | null): void {
    const companyToBeSaved = company ? this.toLocalStorage(company) : null;
    this.localStorage.save(USER_COMPANY_LS_KEY, companyToBeSaved);
  }

  /**
   * Retrieves a WtCompany from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  public fetchFromLocalStorage(): WtCompany | null {
    const locaStorageCompany =
      this.localStorage.fetch<LocaStorageWtCompany>(USER_COMPANY_LS_KEY);
    return this.fromLocalStorage(locaStorageCompany);
  }

  /**
   * Transforms WtCompany to localStorage apporpriate format.
   *
   * @param company
   * @returns
   */
  private toLocalStorage(company: WtCompany): LocaStorageWtCompany {
    return {
      nombres: company.nombres,
      apellidos: company.apellidos,
      numeroDocumento: company.numeroDocumento,
      direccion: company.direccion,
      pais: company.pais,
      departamento: company.departamento,
      municipio: company.municipio,
      photo: company.photo,
    };
  }

  /**
   * Transforms a LocaStorageWtCompany from localStorage to apporpriate WtCompany format.
   *
   * @param locaStorageWtCompany to be transformet to WtCompany.
   * @returns
   */
  private fromLocalStorage(
    locaStorageWtCompany: LocaStorageWtCompany | null
  ): WtCompany | null {
    return locaStorageWtCompany
      ? {
          nombres: locaStorageWtCompany.nombres,
          apellidos: locaStorageWtCompany.apellidos,
          numeroDocumento: locaStorageWtCompany.numeroDocumento,
          direccion: locaStorageWtCompany.direccion,
          pais: locaStorageWtCompany.pais,
          departamento: locaStorageWtCompany.departamento,
          municipio: locaStorageWtCompany.municipio,
          photo: locaStorageWtCompany.photo,
        }
      : null;
  }
}
