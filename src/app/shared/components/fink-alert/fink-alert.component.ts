import { Component, Input, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AlertFinkApp } from "src/app/models/alert.model";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-fink-alert",
  templateUrl: "./fink-alert.component.html",
  styleUrls: ["./fink-alert.component.scss"],
})
export class FinkAlertComponent implements OnInit {
  @Input() info: AlertFinkApp;

  constructor(
    private modalController: ModalController,
    private utilsSvc: UtilsService
  ) {}

  ngOnInit() {}

  confirm() {
    if (this.info.route) {
      this.utilsSvc.routerLink(this.info.route);
    }

    this.modalController.dismiss({ confirm: true });
  }
}
