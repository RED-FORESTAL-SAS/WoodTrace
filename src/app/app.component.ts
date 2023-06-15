import { Component } from "@angular/core";
import { Device } from "@awesome-cordova-plugins/device/ngx";
import { Platform } from "@ionic/angular";
import { UtilsService } from "./services/utils.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private utilsSvc: UtilsService,
    private device: Device
  ) {
    this.platform.ready().then(() => {
      this.saveDevice();
    });
  }

  /**
   * It saves the device's uuid and model to local storage
   */
  saveDevice() {
    let device;
    if (this.platform.is("cordova")) {
      device = {
        uuid: this.device.uuid,
        model: this.device.platform + " " + this.device.model,
      };
    } else {
      device = {
        uuid: "macwinlin5s3s5",
        model: "Web device",
      };
    }

    this.utilsSvc.saveLocalStorage("currentDevice", device);
  }
}
