import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { UserService } from "../services/user.service";

@Injectable({
  providedIn: "root",
})
export class NoVerifyEmailGuard implements CanActivate {
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
          this.router.navigate(["/login"]);
          return false;
        }

        if (user.emailVerified) {
          this.router.navigate(["/tabs/profile"]);
          return false;
        }

        return true;
      })
    );
  }
}
