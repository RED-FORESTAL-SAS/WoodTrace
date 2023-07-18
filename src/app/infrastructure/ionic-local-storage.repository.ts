import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage-angular";

/**
 * Repository to access Local Storage.
 */
@Injectable({
  providedIn: "root",
})
export class IonicLocalStorageRepository {
  private storageInstance: Storage | null = null;

  constructor(private storage: Storage) {}

  public async init(): Promise<void> {
    const storage = await this.storage.create();
    this.storageInstance = storage;
  }

  /**
   * Returns a value from local storage, given it's key.
   *
   * @param key
   * @returns
   */
  public async fetch<T>(key: string): Promise<T | null> {
    const data = await this.storageInstance.get(key);
    return JSON.parse(data) as T | null;
  }

  /**
   * Saves a value to local storage, given a key and some data. Keep in mind that the data will be
   * stringified and complex objects could loose data.
   *
   * @param key
   * @param data
   */
  public async save<T>(key: string, data: T | null): Promise<void> {
    const json = JSON.stringify(data);
    await this.storageInstance.set(key, json);
  }

  /**
   * Deletes a value from local storage, given it's key.
   *
   * @param key
   */
  public async delete(key: string): Promise<void> {
    await this.storageInstance.remove(key);
  }
}
