import { Pipe, PipeTransform } from "@angular/core";
import { FieldValue, Timestamp } from "firebase/firestore";

/**
 * Pipe que convierte un Timestamp a milliseconds,
 * para poder convertirlo a Date.
 */
@Pipe({ name: "isoDateToddmmyyyy" })
export class IsoDateToddmmyyyyPipe implements PipeTransform {
  transform(value: string|null): string | null {
    if (!value) {
      return null;
    }

    const anoMesDia = value.split('-');

    return anoMesDia[2] + '-' + anoMesDia[1] + '-' + anoMesDia[0];
  }
}
