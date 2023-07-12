import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { UtilsService } from "src/app/services/utils.service";
import { especie } from "src/assets/data/especies";

@Component({
  selector: "app-especie-modal",
  templateUrl: "./especie-modal.component.html",
  styleUrls: ["./especie-modal.component.scss"],
})
export class EspecieModalComponent implements OnInit {
  searchString = new FormControl("", []);
  loading: boolean;
  especies = especie;

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {}

  selectEspecie(especie: especie) {
    this.utilsSvc.closeModal({ especie });
  }

  buscarEspecie() {
    console.log("buscar especie");
  }
}
