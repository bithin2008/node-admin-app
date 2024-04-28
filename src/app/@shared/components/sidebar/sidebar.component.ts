import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Observable, debounceTime } from 'rxjs';
import { ApiService } from 'src/app/@core/services/api.service';
import { AuthService } from 'src/app/@core/services/auth.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { NavigationService } from 'src/app/@core/services/navigation.service';
import { SideNavDirection } from 'src/app/@utils/enums/side-nav-direction';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AlertService } from 'src/app/@core/services/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  availableClasses: string[] = ["sidebar-hide", "sidebar-show"];
  currentClassIdx: number = 0;
  bodyClass: string;
  validateUserAuthRes: any
  isSystemAdmin: number = 0;
  isSuperAdmin: number = 0;
  userRole = AppConfig.userRole;
  welcomeUserText = '';
  loading = false;
  hasMenuItems: boolean = false;
  accessableModuleSubmodules: any = [];
  constructor(
    private navService: NavigationService,
    private shrdSvc: SharedService,
    private router: Router,
    private alertService: AlertService,
    private commonSvc: CommonService,
    private apiSvc: ApiService,
  ) {
    this.bodyClass = this.availableClasses[this.currentClassIdx];
    // Listen for route changes and update active class accordingly
  }
  status: boolean = false;
  ngOnInit(): void {
  }

  ngAfterViewInit() {

    this.shrdSvc.sharedUserData$.subscribe((response: any) => {
      if (response.data) {
        if (response.data.hasOwnProperty('is_system_admin')) {
          this.isSystemAdmin = response.data.is_system_admin;
        }
        this.isSuperAdmin = response.data?.user_role_details?.is_super_admin;
        if (!this.isSystemAdmin) {
          this.accessableModuleSubmodules = response.data.accessable_module_submodules;
          // Sort modules array by sequence
          this.accessableModuleSubmodules.sort((a: any, b: any) => a.module_details.sequence - b.module_details.sequence);
          // Sort submodules array within each module_details object by sequence
          this.accessableModuleSubmodules.forEach((item: any) => {
            if (item.submodules) {
              item.submodules.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0));
            }
          });
          this.generateRoleBasedCondition(response.data?.user_role_id)
        }
        this.hasMenuItems = true;

        setTimeout(() => {
          this.updateActiveClass();

        }, 500);



      }
    })

  }
  liClick(ev: any) {
    if (ev) {
      let evParent = ev.target.parentNode.closest('.menu-item');

      if(evParent.classList.contains("showMenu")){
        evParent.classList.remove("showMenu");
      }
      else{
        let showMenuActv = ev.target.closest('.nav-links-contaner').querySelector('.showMenu');
        if(showMenuActv){
          showMenuActv.classList.remove("showMenu");
        }
        evParent.classList.add("showMenu");
      }
    }
  }
  toggleSidebar() {
    let mainElem: any = document.querySelector(".sds-product__admin");
    let sidebar: any = document.querySelector("app-sidebar");
    let sidebarBtn: any = document.querySelector(".sd-menu");
    if (sidebarBtn) {
      if (sidebar.classList.contains("close")) {
        sidebar.classList.remove("close");
        sidebar.removeAttribute('style');
      } else {
        sidebar.style.pointerEvents = 'none';
        sidebar.classList.add("close");
        setTimeout(() => {
          sidebar.removeAttribute('style');
        }, 500);
      }

      if (mainElem.classList.contains("close")) {
        mainElem.classList.remove("close");
      } else {
        mainElem.classList.add("close");
      }
    }
  }

  getPrevClassIdx(): number {
    return this.currentClassIdx === 0
      ? this.availableClasses.length - 1
      : this.currentClassIdx - 1;
  }

  getNextClassIdx(): number {
    return this.currentClassIdx === this.availableClasses.length - 1
      ? 0
      : this.currentClassIdx + 1;
  }




  closeSideBar() {
    if (this.commonSvc.getScreenResolutionBreakPoint() === 'small' || this.commonSvc.getScreenResolutionBreakPoint() === 'min') {
      this.navService.toggleNavState();
    }
  }

  transform(value: string, size: number = 10): string {
    if (!value) {
      return '';
    }
    const limit = size > 0 ? size : 10;
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

  logout() {
    this.apiSvc.post(AppConfig.apiUrl.logout, {}).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          localStorage.clear();
          this.loading = false;
          this.router.navigateByUrl('/');
        }
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }


  updateActiveClass() {
    const currentRoute = this.router.url;
    let menuItem: any = document.querySelector('.menu-item.active')
    if (menuItem) {
      menuItem.classList.add('showMenu');
    }
  }

  generateRoleBasedCondition(user_role_id: any) {
    this.accessableModuleSubmodules.forEach((element: any) => {
      element?.submodules.forEach((item: any) => {
        switch (user_role_id) {
          case this.userRole.admin:
            // Admin can access all data, no need to add any specific condition
            break;
          case this.userRole.sales_manager:
            // Sales manager can access data of sales users data

            break;
          case this.userRole.sales_representative:
            // Salesman can access data created by themselves
            item.org_sub_module_slug == 'sales-management' ? item.org_sub_module_name = 'My Sales' : item.org_sub_module_name = item?.org_sub_module_name
            item.org_sub_module_slug == 'commissions' ? item.org_sub_module_name = 'My Commission' : item.org_sub_module_name = item?.org_sub_module_name
            item.org_sub_module_slug == 'all-customers' ? item.org_sub_module_name = 'My Customer' : item.org_sub_module_name = item?.org_sub_module_name
            break;

          // Add more cases for other roles if needed

          default:
            // Default condition for unknown roles
            break;
        }
      });
    });



    //  return condition;
  }
}



