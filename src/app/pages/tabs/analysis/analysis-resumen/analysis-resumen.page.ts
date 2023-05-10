import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { take, tap } from "rxjs/operators";
import { FirebaseService } from "src/app/services/firebase.service";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-analysis-resumen",
  templateUrl: "./analysis-resumen.page.html",
  styleUrls: ["./analysis-resumen.page.scss"],
})
export class AnalysisResumenPage implements OnInit, OnDestroy {
  especie = new FormControl("", []);
  especieDeclarada = new FormControl("", []);
  photo = new FormControl("");
  acierto = new FormControl(0);
  fCreado = new FormControl("");

  private sbs: Subscription[] = [];

  date = Date.now();

  analysis: any;
  tree: number;
  constructor(
    private firebaseSvc: FirebaseService,
    private utilsSvc: UtilsService,
    private actRoute: ActivatedRoute,
    private reportService: ReportService
  ) {
    // this.tree = parseInt(this.actRoute.snapshot.paramMap.get("tree"));
    // this.analysis = this.analysisFormData().trees[this.tree];
  }

  ngOnInit() {
    this.populateForm();
  }

  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  populateForm() {
    this.sbs.push(
      this.reportService.activeWood
        .pipe(
          take(1),
          tap({
            next: (wood) => {
              console.log(wood);
              this.especieDeclarada.setValue(wood.especieDeclarada);
              this.especie.setValue(wood.especie);
              this.acierto.setValue(wood.acierto);
              this.photo.setValue(wood.path);
            },
          })
        )
        .subscribe()
    );
  }

  analysisFormData() {
    return this.utilsSvc.getFromLocalStorage("analysis");
  }

  submit() {
    this.utilsSvc.routerLink("/tabs/analysis/analysis-trees/ready");
  }
}
