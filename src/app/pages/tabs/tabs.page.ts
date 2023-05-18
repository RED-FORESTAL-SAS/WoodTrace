import { Component } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.page.html",
  styleUrls: ["./tabs.page.scss"],
})
export class TabsPage {
  constructor(private utilsService: UtilsService) {}

  public goto(url: string): void {
    this.utilsService.routerLink(`/tabs/${url}`);
  }
}
