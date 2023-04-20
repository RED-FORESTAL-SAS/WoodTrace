import { Injectable } from "@angular/core";
import { LocalStorageRepository } from "../infrastructure/local-storage.repository";
import { User } from "../models/user.model";
import { CURRENT_USER_LS_KEY } from "../constants/current-user-ls-key.constant";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private localStorage: LocalStorageRepository) {}

  /**
   * Returns the current authenticated user from localStorage ¡COULD RETURN NULL!.
   *
   * @returns
   */
  get currentUser(): User | null {
    return this.localStorage.fetch<User>(CURRENT_USER_LS_KEY);
  }

  /**
   * Sets the current authenticated user to localStorage.
   */
  set currentUser(user: User | null) {
    this.localStorage.save<User>(CURRENT_USER_LS_KEY, user);
  }
}
