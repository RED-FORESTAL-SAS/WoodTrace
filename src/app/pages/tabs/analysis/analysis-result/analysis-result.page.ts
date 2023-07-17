import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { take, tap } from "rxjs/operators";
import { WtWood } from "src/app/models/wt-wood";
import { ReportService } from "src/app/services/report.service";
import { Timestamp } from "src/app/types/timestamp.type";

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

  constructor(private reportService: ReportService) {
    this.activeWood$ = this.reportService.activeWood;
  }

  /**
   * Since AnalysisResultPage is not a page but a reused Componente, ionViewWillEnter hook wont be
   * called. ngOnDestroy must be used instead.
   */
  ngOnInit(): void {
    this.populateForm();
  }

  /**
   * Since AnalysisResultPage is not a page but a reused Componente, ionViewWillLeave hook wont be
   * called. ngOnDestroy must be used instead.
   */
  ngOnDestroy(): void {
    this.sbs.forEach((s) => s.unsubscribe());
  }

  /**
   * Populate form with ActiveWood data.
   */
  populateForm() {
    this.sbs.push(
      this.reportService.activeWood
        .pipe(
          take(1),
          tap({
            next: (wood) => {
              this.especieReportada.setValue(wood.especieDeclarada);
              this.especie.setValue(wood.especie);
              this.acierto.setValue(wood.acierto);
              this.photo.setValue(wood.url);
              this.fCreado.setValue((wood.fCreado as Timestamp).toDate());
            },
          })
        )
        .subscribe()
    );
  }
}
