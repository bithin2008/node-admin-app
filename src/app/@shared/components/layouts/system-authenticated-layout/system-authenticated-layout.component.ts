import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from 'src/app/@core/services/common.service';
import { NavigationService } from 'src/app/@core/services/navigation.service';

@Component({
  selector: 'app-system-authenticated-layout',
  templateUrl: './system-authenticated-layout.component.html',
  styleUrls: ['./system-authenticated-layout.component.scss']
})
export class SystemAuthenticatedLayoutComponent implements OnInit {
  showSideNav: Observable<any> | undefined;

  constructor(private navService: NavigationService, private commonSvc: CommonService) {}

  ngOnInit() {
    this.showSideNav = this.navService.getShowNav();
  }

  closeSideBar() {
    if (this.commonSvc.getScreenResolutionBreakPoint() === 'xs' || this.commonSvc.getScreenResolutionBreakPoint() === 'sm' || this.commonSvc.getScreenResolutionBreakPoint() === 'md') {
      this.navService.toggleNavState();
    }
  }
}
