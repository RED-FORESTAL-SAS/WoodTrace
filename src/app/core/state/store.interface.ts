import { Observable } from "rxjs";

/**
 * Describes an Store to hold State.
 */
export interface StoreInterface<S> {
  /**
   * Observable with current State.
   */
  state$: Observable<S>;

  /**
   * Current State.
   */
  state: S;

  /**
   * Previous State.
   */
  previous: S | null;

  /**
   * String to identify store (used in console.logs).
   */
  store: string;

  /**
   * Patch State with new (partial) value.
   *
   * @param newValue
   * @param event
   */
  patch(newValue: Partial<S>, event: string): void;

  /**
   * Set state with new (partial) value.
   *
   * @param newValue
   * @param event
   */
  set(newValue: Partial<S>, event: string): void;
}
