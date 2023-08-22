import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { UtilsService } from "../services/utils.service";
import { ReportService } from "../services/report.service";
import { map, take } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AnalysisGuard implements CanActivate {
  constructor(
    private utilsService: UtilsService,
    private reportService: ReportService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.reportService.activeReport.pipe(
      take(1),
      map((report) => {
        // Only open Analysis if active report is not created yet.
        if (report && report.urlPdf === "") {
          return true;
        } else {
          this.utilsService.routerLink("/tabs/analysis/analysis-first");
          return false;
        }
      })
    );
  }
}
