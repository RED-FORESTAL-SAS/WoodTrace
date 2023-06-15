import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-analysis-resumen",
  templateUrl: "./analysis-resumen.page.html",
  styleUrls: ["./analysis-resumen.page.scss"],
})
export class AnalysisResumenPage implements OnInit {
  date = Date.now();

  analysis: any;
  tree: number;
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private actRoute: ActivatedRoute
  ) {
    this.tree = parseInt(this.actRoute.snapshot.paramMap.get("tree"));
    this.analysis = this.analysisFormData().trees[this.tree];
  }

  ngOnInit() {}

  analysisFormData() {
    return this.utilsSvc.getFromLocalStorage("analysis");
  }

  submit() {
    this.utilsSvc.routerLink("/tabs/analysis/analysis-trees/ready");
  }
}
