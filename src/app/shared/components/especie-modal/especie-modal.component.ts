import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";
import { UtilsService } from "src/app/services/utils.service";
import { ESPECIES, Especie } from "src/assets/data/especies";

@Component({
  selector: "app-especie-modal",
  templateUrl: "./especie-modal.component.html",
  styleUrls: ["./especie-modal.component.scss"],
})
export class EspecieModalComponent {
  searchString = new FormControl("", []);
  loading: boolean;

  /** Observable with filteres Especies. */
  public especies$: Observable<Especie[]>;

  constructor(private utilsSvc: UtilsService) {
    // Filter Especies by search string.
    this.especies$ = this.searchString.valueChanges.pipe(
      // force first load.
      startWith(""),
      // wait 400ms after each keystroke before considering the term.
      debounceTime(400),
      // filter by search string making it case unsensitive.
      map((searchString) => {
        const cleanSearchString = searchString
          .toUpperCase()
          .split(" ")
          .filter((e) => e.trim().length > 0)
          .join(" ");
        return cleanSearchString === ""
          ? ESPECIES
          : ESPECIES.filter((e) =>
              e.nombreCientifico.toUpperCase().includes(cleanSearchString)
            );
      })
    );
  }

  selectEspecie(especie: Especie) {
    this.utilsSvc.closeModal({ especie });
  }
}
