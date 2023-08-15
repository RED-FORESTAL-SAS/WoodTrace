import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { UserService } from "../services/user.service";
import { map, take } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class NoAuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.userService.authState.pipe(
      take(1),
      map((user) => {
        if (!user) {
          return true;
        }

        if (user.emailVerified) {
          this.router.navigate(["/tabs/profile"]);
        } else {
          this.router.navigate(["/email-verification"]);
        }

        return false;
      })
    );
  }
}
