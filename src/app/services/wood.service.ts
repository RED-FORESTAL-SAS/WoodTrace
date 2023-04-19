import { Injectable } from "@angular/core";
import { UtilsService } from "./utils.service";
import { LocalstorageWtWood, WtWood } from "../models/wt-wood";
import { Timestamp } from "../types/timestamp.type";

@Injectable({
  providedIn: "root",
})
export class WoodService {
  constructor(private utils: UtilsService) {}

  retrieveActiveWood() {
    /**
     * @todo @mario
     */
  }

  /**
   * Transforms WtWood to localstorage apporpriate format (avoid losing Timestamps).
   *
   * @param wood
   * @returns
   */
  toLocalStorage(wood: WtWood): LocalstorageWtWood {
    return {
      localId: wood.localId,
      localPathXls: wood.localPathXls,
      path: wood.path,
      url: wood.url,
      especieDeclarada: wood.especieDeclarada,
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
   * Transforms a LocastorageWtWood from localstorage to apporpriate WtWood format
   * (reconstruct Timestamps).
   *
   * @param LocalstorageWtWood
   * @returns
   */
  fromLocalStorage(
    LocalstorageWtWood: LocalstorageWtWood | null
  ): WtWood | null {
    return LocalstorageWtWood
      ? {
          localId: LocalstorageWtWood.localId,
          localPathXls: LocalstorageWtWood.localPathXls,
          path: LocalstorageWtWood.path,
          url: LocalstorageWtWood.url,
          especieDeclarada: LocalstorageWtWood.especieDeclarada,
          especie: LocalstorageWtWood.especie,
          acierto: LocalstorageWtWood.acierto,
          wtUserId: LocalstorageWtWood.wtUserId,
          fCreado: new Timestamp(
            LocalstorageWtWood.fCreado.seconds,
            LocalstorageWtWood.fCreado.nanoseconds
          ),
          fModificado: new Timestamp(
            LocalstorageWtWood.fModificado.seconds,
            LocalstorageWtWood.fModificado.nanoseconds
          ),
        }
      : null;
  }
}
