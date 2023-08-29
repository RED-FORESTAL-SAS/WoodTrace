import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { UtilsService } from "src/app/services/utils.service";
import { ESPECIES, Especie } from "src/assets/data/especies";

@Component({
  selector: "app-especie-modal",
  templateUrl: "./especie-modal.component.html",
  styleUrls: ["./especie-modal.component.scss"],
})
export class EspecieModalComponent implements OnInit {
  searchString = new FormControl("", []);
  loading: boolean;
  especies = ESPECIES;

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {}

  selectEspecie(especie: Especie) {
    this.utilsSvc.closeModal({ especie });
  }

  buscarEspecie() {
    console.log("buscar especie");
  }
}
