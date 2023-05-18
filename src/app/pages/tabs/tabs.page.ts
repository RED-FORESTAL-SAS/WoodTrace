import { Component, OnInit } from "@angular/core";
import { FirebaseService } from "src/app/services/firebase.service";

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.page.html",
  styleUrls: ["./tabs.page.scss"],
})
export class TabsPage implements OnInit {
  constructor(private firebaseSvc: FirebaseService) {}

  ngOnInit() {}
}
