import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { AlertService } from '../services/alert.service';
import { SytemAdminAuthService } from '../services/system-admin-auth.service';
import { LoadingBarService } from '@ngx-loading-bar/core';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authSvc: AuthService,
    private systemAuthSvc: SytemAdminAuthService, 
    private loader: LoaderService, 
    private alertSvc: AlertService,
    private loadingBar: LoadingBarService
    ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authSvc.getToken()?this.authSvc.getToken(): this.systemAuthSvc.getToken();
    const isMockServer = AppConfig.useMockServer;
    // this.loader.show();
    this.loader.setLoadingBarState(true);
    // Start the loading bar when a request is initiated
    //this.alertSvc.clear();
    if(authToken && !isMockServer) {
      const clonedReq = request.clone({
        setHeaders: {
          Authorization: 'Bearer '+ authToken
        }
      });
      return next.handle(clonedReq).pipe(
        finalize(() => this.loader.setLoadingBarState(false)),
      );
    } else {
      return next.handle(request).pipe(
        finalize(() =>this.loader.setLoadingBarState(false)),
      );
    }
  }
}
