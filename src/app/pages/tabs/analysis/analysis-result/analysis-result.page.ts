import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { take, tap } from "rxjs/operators";
import { WtWood } from "src/app/models/wt-wood";
import { ReportService } from "src/app/services/report.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-analysis-result",
  templateUrl: "./analysis-result.page.html",
  styleUrls: ["./analysis-result.page.scss"],
})
export class AnalysisResultPage implements OnInit, OnDestroy {
  especie = new FormControl("", []);
  especieReportada = new FormControl("", []);
  photo = new FormControl("");
  acierto = new FormControl(0);
  fCreado = new FormControl(null);

  /** Observable with active report or null. */
  public activeWood$: Observable<WtWood | null>;

  private sbs: Subscription[] = [];

  analysis: any;
  tree: number;
  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {
    this.activeWood$ = this.reportService.activeWood;
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
              this.especieReportada.setValue(wood.especieDeclarada);
              this.especie.setValue(wood.especie);
              this.acierto.setValue(wood.acierto);
              this.photo.setValue(wood.path);
              this.fCreado.setValue(wood.fCreado);
            },
          })
        )
        .subscribe()
    );
  }

  onRehacer() {
    this.reportService.patchActiveWood(this.reportService.emptyWood);
    this.utilsSvc.routerLink("/tabs/analysis/take-photos");
  }

  onGuardar() {
    this.reportService.saveActiveWood();
    this.utilsSvc.routerLink("/tabs/analysis/analysis-list");
  }

  onVolver() {
    this.utilsSvc.routerLink("/tabs/analysis/analysis-list");
  }
}
