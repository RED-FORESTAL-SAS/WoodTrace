import { Component, OnInit } from "@angular/core";
import { UtilsService } from "src/app/services/utils.service";
import { ReportService } from "src/app/services/report.service";
import { WtReport } from "src/app/models/wt-report";
import { Observable, Subscription } from "rxjs";
import { WtWood } from "src/app/models/wt-wood";
import { FormControl } from "@angular/forms";
import { take, tap } from "rxjs/operators";

@Component({
  selector: "app-report-details",
  templateUrl: "./report-details.page.html",
  styleUrls: ["./report-details.page.scss"],
})
export class ReportDetailsPage implements OnInit {
  placa = new FormControl("", []);
  guia = new FormControl("", []);
  ubicacion = new FormControl({ lat: 0, lng: 0 }, []);
  woods: WtWood[] = [];

  public activeReport$: Observable<WtReport | null>;

  private sbs: Subscription[] = [];

  loading: boolean;
  constructor(
    private utilsSvc: UtilsService,
    private reportService: ReportService
  ) {
    this.activeReport$ = this.reportService.activeReport;
  }

  ngOnInit() {
    this.populateForm();
  }

  populateForm() {
    this.sbs.push(
      this.reportService.activeReport
        .pipe(
          take(1),
          tap({
            next: (report) => {
              console.log(report);
              this.placa.setValue(report.placa);
              this.guia.setValue(report.guia);
              this.ubicacion.setValue(report.ubicacion);
              this.woods = report.woods;
            },
          })
        )
        .subscribe()
    );
  }

  onViewWood(wood: WtWood) {
    this.reportService.patchActiveWood(wood);
    this.utilsSvc.routerLink("/tabs/analysis/analysis-result");
  }
}
