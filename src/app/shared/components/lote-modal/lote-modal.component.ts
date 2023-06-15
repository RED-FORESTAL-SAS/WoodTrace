import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { User } from "src/app/models/user.model";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-lote-modal",
  templateUrl: "./lote-modal.component.html",
  styleUrls: ["./lote-modal.component.scss"],
})
export class LoteModalComponent implements OnInit {
  property = new FormControl("", [Validators.required]);
  properties = [];

  loading: boolean;

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {
    this.getProperties();
  }

  currentUser(): User {
    return this.utilsSvc.getCurrentUser();
  }

  getProperties() {
    this.properties = this.currentUser().properties.map((property) => {
      return {
        value: property,
        content: property,
      };
    });
  }

  submit() {
    let analisys = this.utilsSvc.getFromLocalStorage("analysis");
    analisys.property = this.property.value;

    this.utilsSvc.saveLocalStorage("analysis", analisys);
    this.utilsSvc.closeModal({ done: true });
  }

  resetForm() {
    this.property.reset();
  }

  validator() {
    if (this.property.invalid) {
      return false;
    }

    return true;
  }
}
