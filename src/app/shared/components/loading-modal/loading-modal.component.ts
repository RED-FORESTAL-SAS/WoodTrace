import { Component, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-loading-modal",
  templateUrl: "./loading-modal.component.html",
  styleUrls: ["./loading-modal.component.scss"],
})
export class LoadingModalComponent implements OnInit {
  constructor(private utilsSvc: UtilsService) {}

  ngOnInit() {}
}
