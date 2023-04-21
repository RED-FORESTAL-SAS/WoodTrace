import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { StoreInterface } from "./store.interface";

/**
 * Base class for a Store. Meant to be extended.
 */
export abstract class BaseStore<S> implements StoreInterface<S> {
  public state$: Observable<S>;
  public state: S;
  public previous: S | null = null;

  /**
   * If debug info should be shown in console.
   *
   * @default false
   */
  protected debug = false;

  protected bs: BehaviorSubject<S>;
  public abstract store: string;

  /**
   * Set initial value in Store and intialize state$ observable.
   *
   * @param initialValue
   */
  constructor(initialValue: Partial<S>) {
    this.bs = new BehaviorSubject<S>(initialValue as S);
    this.state$ = this.bs.asObservable();
    this.state = initialValue as S;
    this.state$.subscribe((s) => {
      this.state = s;
    });
  }

  patch(newValue: Partial<S>, event: string = "Not specified"): void {
    this.previous = this.state;
    const newState = Object.assign({}, this.state, newValue);
    if (!environment.production && this.debug) {
      console.groupCollapsed(`[${this.store} store] [patch] [event: ${event}]`);
      console.log("change", newValue);
      console.log("prev", this.previous);
      console.log("next", newState);
      console.groupEnd();
    }
    this.bs.next(newState);
  }

  set(newValue: Partial<S>, event: string = "Not specified"): void {
    this.previous = this.state;
    const newState = Object.assign({}, newValue) as S;
    if (!environment.production && this.debug) {
      console.groupCollapsed(`[${this.store} store] [set] [event: ${event}]`);
      console.log("change", newValue);
      console.log("prev", this.previous);
      console.log("next", newState);
      console.groupEnd();
    }
    this.bs.next(newState);
  }
}
