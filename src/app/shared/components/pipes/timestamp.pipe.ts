import { Pipe, PipeTransform } from "@angular/core";
import { FieldValue, Timestamp } from "firebase/firestore";

/**
 * Pipe que convierte un Timestamp a milliseconds,
 * para poder convertirlo a Date.
 */
@Pipe({ name: "timestamp" })
export class TimeStampPipe implements PipeTransform {
  transform(value: Timestamp | FieldValue): Date | null {
    const v = value as Timestamp;
    if (!v || !v.seconds) {
      return null;
    }
    return v.toDate();
  }
}
