import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AnalysisGuard implements CanActivate {
  constructor(private utilsService: UtilsService) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


    let analysis = this.utilsService.getFromLocalStorage('analysis');


    if (analysis) {
      return true;
    } else {
      this.utilsService.routerLink('/tabs/analysis');
      return false;
    }



  }

}
