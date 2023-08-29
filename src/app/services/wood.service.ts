import { Injectable } from "@angular/core";
import { LocalStorageWtWood, WtWood } from "../models/wt-wood";
import { Timestamp } from "../types/timestamp.type";
import { ACTIVE_WOOD_LS_KEY } from "../constants/active-wood-ls-key.constant";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";

@Injectable({
  providedIn: "root",
})
export class WoodService {
  constructor(private localStorage: LocalStorageRepository) {}

  /**
   * Saves a WtWood to localStorage.
   *
   * @param report
   */
  saveToLocalStorage(wood: WtWood | null): void {
    const woodToBeSaved = wood ? this.toLocalStorage(wood) : null;
    this.localStorage.save<LocalStorageWtWood>(
      ACTIVE_WOOD_LS_KEY,
      woodToBeSaved
    );
  }

  /**
   * Retrieves WtWood from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  fetchFromLocalStorage(): WtWood | null {
    const localStorageWood =
      this.localStorage.fetch<LocalStorageWtWood>(ACTIVE_WOOD_LS_KEY);
    return this.fromLocalStorage(localStorageWood);
  }

  /**
   * Transforms WtWood to localStorage apporpriate format (avoid losing Timestamps).
   *
   * @param wood
   * @returns
   */
  toLocalStorage(wood: WtWood): LocalStorageWtWood {
    return {
      localId: wood.localId,
      localPath: wood.localPath,
      path: wood.path,
      url: wood.url,
      especieDeclarada: wood.especieDeclarada,
      especieResultante: wood.especieResultante,
      especie: wood.especie,
      acierto: wood.acierto,
      wtUserId: wood.wtUserId,
      fCreado: {
        seconds: (wood.fCreado as Timestamp).seconds,
        nanoseconds: (wood.fCreado as Timestamp).nanoseconds,
      },
      fModificado: {
        seconds: (wood.fModificado as Timestamp).seconds,
        nanoseconds: (wood.fModificado as Timestamp).nanoseconds,
      },
    };
  }

  /**
   * Transforms a LocaStorageWtWood from localStorage to apporpriate WtWood format
   * (reconstruct Timestamps).
   *
   * @param LocalStorageWtWood
   * @returns
   */
  fromLocalStorage(
    LocalStorageWtWood: LocalStorageWtWood | null
  ): WtWood | null {
    return LocalStorageWtWood
      ? {
          localId: LocalStorageWtWood.localId,
          localPath: LocalStorageWtWood.localPath,
          path: LocalStorageWtWood.path,
          url: LocalStorageWtWood.url,
          especieDeclarada: LocalStorageWtWood.especieDeclarada,
          especieResultante: LocalStorageWtWood.especieResultante,
          especie: LocalStorageWtWood.especie,
          acierto: LocalStorageWtWood.acierto,
          wtUserId: LocalStorageWtWood.wtUserId,
          fCreado: new Timestamp(
            LocalStorageWtWood.fCreado.seconds,
            LocalStorageWtWood.fCreado.nanoseconds
          ),
          fModificado: new Timestamp(
            LocalStorageWtWood.fModificado.seconds,
            LocalStorageWtWood.fModificado.nanoseconds
          ),
        }
      : null;
  }
}
