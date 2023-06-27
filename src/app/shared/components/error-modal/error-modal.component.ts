import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-error-modal",
  templateUrl: "./error-modal.component.html",
  styleUrls: ["./error-modal.component.scss"],
})
export class ErrorModalComponent implements OnInit {
  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {}

  volver() {
    this.utilsSvc.closeModal({});
  }
}
