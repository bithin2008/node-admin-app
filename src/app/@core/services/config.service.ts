import { Injectable, VERSION } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../@utils/const/app.config';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private http: HttpClient) { }
  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      AppConfig.apiBaseUrl =environment.apiBaseUrl
      resolve(true)
    });
  }
/*   initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadConfig()
        .then(res => {
          resolve(true);
        })
        .catch(err => {
        });
    });
  } */

  loadConfig() {
    const configJSONFile = `assets/config/config.${environment.name}.json`;
    return new Promise((resolve, reject) => {
      this.http.get(configJSONFile)
        .subscribe(
          (config: any) => {
            AppConfig.apiBaseUrl =environment.apiBaseUrl// config.useMockServer ? config.mockAPIUrl : config.apiBaseUrl;
            // AppConfig.useMockServer = config.useMockServer;
            // AppConfig.title = config.title;
            // AppConfig.productName = config?.productName;
            // AppConfig.copyrightInfo = config?.copyrightInfo;
            // AppConfig.version = config?.version;
            AppConfig.maintenanceMode = config.maintenanceMode || false;
            return resolve(config);
          },
          err => {
            return reject(err);
          }
        );
    });
  }

}
