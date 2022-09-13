import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoVerifyEmailGuard implements CanActivate {

  constructor(private utilsService: UtilsService){}


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


   let user: User = this.utilsService.getCurrentUser(); 

 
   if(user && !user.emailVerified){
    return true;
   }

   if(user && user.emailVerified){
    this.utilsService.routerLink('/tabs/profile');
    return false;
   }
   
   if(!user){
    this.utilsService.routerLink('/login');
    return false;
   }
   
  }
}
