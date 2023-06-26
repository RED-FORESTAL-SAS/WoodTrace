import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-loading-modal",
  templateUrl: "./loading-modal.component.html",
  styleUrls: ["./loading-modal.component.scss"],
})
export class LoadingModalComponent implements OnInit {
  // loading = new FormControl("", [Validators.required]);
  searchString = new FormControl("", []);
  loading: boolean;

  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {}

  // selectLoading(loading: loading) {
  //   this.utilsSvc.closeModal({ loading });
  // }

  // buscarLoading() {
  //   console.log("buscar loading");
  // }
}
