import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private utilsService: UtilsService){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


   let user = this.utilsService.getCurrentUser(); 

   
   if(user && user.emailVerified){
    return true;
   }

   if(user && !user.emailVerified){
    this.utilsService.routerLink('/email-verification');
    return false;
   }

   if(!user){
    this.utilsService.routerLink('/login');
    return false;

   }
   

   
  }
  
}
