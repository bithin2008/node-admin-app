import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppConfig } from '../../@utils/const/app.config';
import { AlertService } from './alert.service';
@Injectable({
  providedIn: 'root'
})
export class SytemAdminAuthService {
  private loggedInUserSubject!: BehaviorSubject<any>;
  public loggedInUser!: Observable<any>;

  constructor(private http: HttpClient, private router: Router,
    private alertSvc: AlertService) {
    const loggedInData: any = localStorage.getItem('loginData');
    this.loggedInUserSubject = new BehaviorSubject<any>(JSON.parse(loggedInData));
    this.loggedInUser = this.loggedInUserSubject.asObservable();
  }

  isTokenExpired() {
    return false;
  }

  isLoggedIn() {
    const authToken = this.getToken();
    return (authToken !== null) ? true : false;
  }

  authenticate(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.orgAdmin.authenticate, postData)
      .pipe(map(response => {
        localStorage.setItem('otp_key', response.otpkey);
        //  this.loggedInUserSubject.next(response);
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }

  authenticateSystemAdmin(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.systemAdmin.authenticateSystemAdmin, postData)
      .pipe(map(response => {
        localStorage.setItem('system_admin_otp_key', response.otpkey);
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }

  resendloginOTP(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.systemAdmin.resendLoginOtp, postData)
      .pipe(map(response => {
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }
  validateOTP(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.orgAdmin.validateOTP, postData)
      .pipe(map(response => {
        if (response.status==1) {
          localStorage.setItem('system_admin_token', response.token);
          localStorage.removeItem('token');
        }
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }
  resendSystemAdminloginOTP(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.systemAdmin.resendLoginOtp, postData)
      .pipe(map(response => {
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }
  validateSystemAdminOTP(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.systemAdmin.validateSystemAdminOTP, postData)
      .pipe(map(response => {
        localStorage.setItem('system_admin_token', response.token);
        localStorage.removeItem('otp_key');
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }

  updateSystemAdminPassword(postData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.systemAdmin.systemAdminUpdatePassword, postData)
      .pipe(map(response => {
        return response;
      }), catchError((err) => {
        return throwError(err); //Rethrow it back to component
      }));
  }

  validateUserToken(tokenData: any) {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.orgAdmin.activateUser + '/' + tokenData, {})
      .pipe(map(response => {
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        return throwError(err); //Rethrow it back to component
      }));
  }

  getToken() {
    return localStorage.getItem('system_admin_token');
  }

  getUser() {
    return JSON.parse(localStorage.getItem('loginData') || '') || {};
  }

  logout() {
    localStorage.removeItem('system_admin_token');
    //localStorage.clear();
    this.loggedInUserSubject.next(null);
   // this.alertSvc.info('You have been logged out!', true);
    this.router.navigate(['auth/login']);
  }

  systemAdminLogout() {

    localStorage.removeItem('system_admin_token');
    //localStorage.clear();
    this.loggedInUserSubject.next(null);
   // this.alertSvc.info('You have been logged out!', true);
    this.router.navigate(['auth/system-admin-login']);
  }

  validateToken() {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.orgAdmin.validateToken, {})
      .pipe(map(response => {
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        this.router.navigateByUrl('/');
        localStorage.removeItem('token')
        return throwError(err); //Rethrow it back to component
      }));
  }

  validateSystemAdminToken() {
    return this.http.post<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.systemAdmin.validateSystemAdminToken, {})
      .pipe(map(response => {
        return response;
      }), catchError((err) => {
        //err.statusText = err?.error?.data?.message;
        this.systemAdminLogout()
        return throwError(err); //Rethrow it back to component
      }));
  }

  validateRolePermissions() {
    return this.http.get<any>(AppConfig.apiBaseUrl + AppConfig.apiUrl.orgAdmin.validateRolePermissions);
  }

  getUserId() {
    const user = JSON.parse(localStorage.getItem('loginData') || '') || {};
    return user.id;
  }

  getRoleId() {
    const user = JSON.parse(localStorage.getItem('loginData') || '') || {};
    return user.user_role;
  }

  checkUSerRole() {

  }
}
