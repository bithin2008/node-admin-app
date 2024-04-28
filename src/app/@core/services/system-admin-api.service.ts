import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SystemAdminApiService {
  token: any;
  headersObj: any;
  options: any;
  roleAs: any
  constructor(private http: HttpClient) { }
  getHeader() {
    this.token = localStorage.getItem('system_admin_token');
    this.headersObj = new HttpHeaders()
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Authorization', 'Bearer ' + this.token);
    let header = {
      headers: this.headersObj,
    };
    return header;
  }
  getFileHeader() {
    this.token = localStorage.getItem('system_admin_token');
    this.headersObj = new HttpHeaders()
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

}
