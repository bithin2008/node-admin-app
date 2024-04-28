import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/@core/services/auth.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { NavigationService } from 'src/app/@core/services/navigation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
@Component({
  selector: 'app-authenticated-layout',
  templateUrl: './authenticated-layout.component.html',
  styleUrls: ['./authenticated-layout.component.scss']
})
export class AuthenticatedLayoutComponent implements OnInit {
  subscription!: Subscription 
  showSideNav: Observable<any> | undefined;
 data:any;
 verifying:boolean=false;

  constructor(
    private navService: NavigationService,
    private commonSvc: CommonService, 
    private authSvc:AuthService, 
    private sharedService:SharedService,
    private cdr:ChangeDetectorRef
    
    ) {
  }

  async ngOnInit() {
    this.showSideNav = this.navService.getShowNav();
    let res =    await this.validateUserAuth()
    if(res)
    this.checkPermission()

  }


  closeSideBar() {
    if (this.commonSvc.getScreenResolutionBreakPoint() === 'xs' || this.commonSvc.getScreenResolutionBreakPoint() === 'sm' || this.commonSvc.getScreenResolutionBreakPoint() === 'md') {
      this.navService.toggleNavState();
    }
  }
  checkPermission(){
    this.subscription = this.sharedService.sharedUserData$.subscribe((response: any) => {
      if (response.data) {
        this.data =response.data
        this.data.accessable_module_submodules.forEach((element:any) => {
        });
      }
    })
  }
  validateUserAuth() {
    return new Promise((resolve, reject) => {
      this.verifying=true
      this.authSvc.validateToken().subscribe({
        next: (response: any) => {
          if (response.status == 1) {
           this.sharedService.updateUserData(response);
           this.verifying=false
            resolve(true);
           const jsonData = JSON.stringify(response);
           localStorage.setItem('secret_data', btoa(jsonData));
          } else {
           this.authSvc.logout()
          }
        }, error: (err: HttpErrorResponse) => {
          console.log(err.error.message);
          this.verifying=false
          this.authSvc.logout()
          reject(err.message);
        },
        complete: () => {  this.cdr.detectChanges();
        }
      });
    })
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }






}
