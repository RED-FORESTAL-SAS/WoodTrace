import { Injectable } from "@angular/core";
import { BaseStore } from "../core/state/base.store";
import { UserState } from "./user.state";

@Injectable({
  providedIn: "root",
})
export class UserStore extends BaseStore<UserState> {
  public store = "user-store" + "-" + Date.now().toString().slice(-3);

  /**
   * @todo @diana Poner en false antes de tirar a producción.
   */
  protected override debug = true;

  constructor() {
    super({
      company: null,
      license: null,
      user: null,
      error: null,
    });
  }
}
