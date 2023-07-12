import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { UtilsService } from "../services/utils.service";

@Injectable({
  providedIn: "root",
})
export class IntroGuard implements CanActivate {
  constructor(private utilsService: UtilsService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    let introViewed = localStorage.getItem("introViewed");

    if (introViewed) {
      this.utilsService.routerLink("/login");
      return false;
    } else {
      return true;
    }
  }
}
