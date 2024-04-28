import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, CanActivateChild, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertService } from 'src/app/@core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from 'src/app/@core/services/shared.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
  constructor(
    private router: Router,
    private shrdSvc: SharedService,
    private authService: AuthService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
  ) {

  }
  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let validateUser: any = await this.validateUserAuth();
    if (validateUser) {
      return true;
    } else {
      return false;
    }
  }

  validateUserAuth() {
     return new Promise((resolve, reject) => {
     let authData=localStorage.getItem('token');
      if (authData) {
        resolve(true);
      } else {
        this.authService.logout()
      }
    })
  }

}
