import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { UtilsService } from "../services/utils.service";
import { UserService } from "../services/user.service";
import { map, take } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class IntroGuard implements CanActivate {
  constructor(
    private utilsService: UtilsService,
    private userService: UserService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // @dev wait until authState is ready before any request to localStorage.
    return this.userService.authState.pipe(
      take(1),
      map((user) => {
        let introViewed = localStorage.getItem("introViewed");

        if (!!introViewed && !!user) {
          this.utilsService.routerLink("/login");
          return false;
        } else {
          return true;
        }
      })
    );
  }
}
