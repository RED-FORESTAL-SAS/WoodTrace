import { Injectable } from "@angular/core";

/**
 * Repository to access Local Storage.
 */
@Injectable({
  providedIn: "root",
})
export class LocalStorageRepository {
  constructor() {}

  /**
   * Returns a value from local storage, given it's key.
   *
   * @param key
   * @returns
   */
  fetch<T>(key: string): T | null {
    return JSON.parse(localStorage.getItem(key)) as T | null;
  }

  /**
   * Saves a value to local storage, given a key and some data. Keep in mind that the data will be
   * stringified and complex objects could loose data.
   *
   * @param key
   * @param data
   */
  save<T>(key: string, data: T | null): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Deletes a value from local storage, given it's key.
   *
   * @param key
   */
  delete(key: string): void {
    localStorage.removeItem(key);
  }
}
