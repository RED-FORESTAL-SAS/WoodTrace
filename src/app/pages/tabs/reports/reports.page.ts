import { Component, OnInit } from "@angular/core";
import { ExcelService } from "src/app/services/excel.service";
import { FirebaseService } from "src/app/services/firebase.service";
import { UtilsService } from "src/app/services/utils.service";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"],
})
export class ReportsPage implements OnInit {
  date = Date.now();

  reports = [];
  loading: boolean;
  constructor(
    private utilsSvc: UtilsService,
    private firebaseSvc: FirebaseService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    if (!this.utilsSvc.getFromLocalStorage("reports")) {
      this.reports = [];
    } else {
      this.reports = this.utilsSvc.getFromLocalStorage("reports");
    }

    this.getReports();
  }

  //=========== Cargar reportes =============
  getReports() {
    this.loading = true;
    let currentUser = this.utilsSvc.getCurrentUser();

    let ref = this.firebaseSvc
      .getCollectionConditional("reports", (ref) =>
        ref.where("userId", "==", currentUser.id).orderBy("date", "desc")
      )
      .subscribe((data) => {
        this.reports = data.map((e) => {
          return {
            id: e.payload.doc.id,
            userId: e.payload.doc.data()["userId"],
            excel: e.payload.doc.data()["excel"],
            pdf: e.payload.doc.data()["pdf"],
            operator: e.payload.doc.data()["operator"],
          };
        });

        this.utilsSvc.saveLocalStorage("reports", this.reports);

        this.loading = false;
        ref.unsubscribe();
      });
  }

  //=========== Descargar reporte =============
  async dowloadReport(report) {
    let passwordValid = await this.utilsSvc.passwordRequired();

    if (passwordValid) {
      this.utilsSvc.presentLoading();

      setTimeout(() => {
        this.utilsSvc.dismissLoading();
        this.utilsSvc.downloadReport(report);
      }, 1000);
    }
  }

  //=========== Elinar reporte =============
  async deleteReport(id: string) {
    let passwordValid = await this.utilsSvc.passwordRequired();
    let currentUser = this.utilsSvc.getCurrentUser();

    if (passwordValid) {
      this.utilsSvc.presentLoading();
      this.firebaseSvc.deleteFromCollection("reports", id).then(
        async (res: any) => {
          await this.firebaseSvc.deleteFromStorage(
            `${currentUser.id}/reports/${id}.pdf`
          );
          await this.firebaseSvc.deleteFromStorage(
            `${currentUser.id}/reports/${id}.xlsx`
          );

          this.getReports();
          this.utilsSvc.dismissLoading();
        },
        (error) => {
          this.utilsSvc.presentToast("Ha ocurrido un error, intenta de nuevo.");
          this.utilsSvc.dismissLoading();
        }
      );
    }
  }
}
