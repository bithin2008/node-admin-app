import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { AlertService } from 'src/app/@core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SytemAdminAuthService } from '../services/system-admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminAuthGuard implements CanActivateChild {
  constructor(private router: Router, private sharedService:SharedService, private sytemAdminAuthService: SytemAdminAuthService, private alertService: AlertService) { }
  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    let validateSystemAdmin: any = await this.validateSystemAdminAuth();;
    if (validateSystemAdmin) {
      return true;
    } else {
      return false;
    }
  }

  validateSystemAdminAuth() {
    return new Promise((resolve, reject) => {
      this.sytemAdminAuthService.validateSystemAdminToken().subscribe(
        (response: any) => {
          if(response.status==1){
            this.sharedService.updateUserData(response);
            resolve(true);
          }else{
            this.sytemAdminAuthService.systemAdminLogout()
            this.alertService.error(response.message)
          }
         
        },
        (error) => {
          reject(false);
        }
      );
    });
  }

}
