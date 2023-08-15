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
import { map, take, withLatestFrom } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
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
      withLatestFrom(this.userService.online), // Force online check.
      map(([user, _]) => {
        if (!user || !user.activo) {
          this.router.navigate(["/login"]);
          return false;
        }

        if (!user.emailVerified) {
          this.router.navigate(["/email-verification"]);
          return false;
        }

        return true;
      })
    );
  }
}
