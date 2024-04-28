import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { SharedService } from './shared.service';
import { Observable, catchError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  token: any;
  headersObj: any;
  options: any;
  roleAs: any;
  accessPermissionObj=null
  constructor(private http: HttpClient,private sharedService:SharedService) { 
    this.sharedService.sharedSubmoduleDetails$.subscribe((response: any) => {
   //  console.log(response);
     if (response) {
        this.accessPermissionObj={
          org_sub_module_id:response.org_sub_module_id,
          ...response.permission_details
        } 
      }
    })
  }
  getHeader() {    
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer ' + this.token);
      // if (this.accessPermissionObj !== null) {
      //   this.headersObj = this.headersObj.set('Access-Permission', JSON.stringify(this.accessPermissionObj));
      // }
    let header = {
      headers: this.headersObj,

    };
    return header;
  }
  getFileHeader() {
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
      .set('Authorization', 'Bearer ' + this.token);
    let header = {
      headers: this.headersObj,
    };
    return header;
  }
  downloadFileHeader() {
    this.token = localStorage.getItem('token');
    this.headersObj = new HttpHeaders()
    .set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      .set('Authorization', 'Bearer ' + this.token);
    let header = {
      headers: this.headersObj,
    };
    return header;
  }

  public iconGet(url: string, options?: any) {
    return this.http.get(url, this.getHeader());
  }
  public get(url: string, options?: any) {
    
    return this.http.get(AppConfig.apiBaseUrl + url, this.getHeader());
  }

  public post(url: string, data: any, options?: any) {
    return this.http.post(AppConfig.apiBaseUrl + url, data, this.getHeader());
  }

  public put(url: string, data: any, options?: any) {
    return this.http.put(AppConfig.apiBaseUrl + url, data, this.getHeader());
  }

  public fileupload(url: string, data: any, options?: any) {
    return this.http.post(AppConfig.apiBaseUrl + url, data, this.getFileHeader());
  }

  public patch(url: string, data: any, options?: any) {
    return this.http.patch(AppConfig.apiBaseUrl + url, data, this.getHeader());
  }

  public delete(url: string, options?: any) {
    return this.http.delete(AppConfig.apiBaseUrl + url, this.getHeader());
  }
  public downloadFile(url: string,  data: any,options?: any): Observable<any> {
    return this.http
      .post(AppConfig.apiBaseUrl + url,data, { headers: {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}, observe: 'response', responseType: 'blob' })
  
  }
  public download(url: string): Observable<HttpResponse<Blob>> {
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
