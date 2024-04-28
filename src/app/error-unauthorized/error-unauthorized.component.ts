import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CommonService } from '../@core/services/common.service';
@Component({
  selector: 'app-error-unauthorized',
  templateUrl: './error-unauthorized.component.html',
  styleUrls: ['./error-unauthorized.component.scss']
})
export class ErrorUnauthorizedComponent implements OnInit {
public baseUrl:any=''
  constructor(private commonSvc: CommonService, private router: Router, private ngZone: NgZone) {
    this.commonSvc.setTitle('Error Unauthorized');
   // window.location.reload();
  }
  ngOnInit() {
   //this.baseUrl=window.location.href.replace('unauthorized','');

  }
  goToHome() {
    this.router.navigate(['/dashboard']);
  }
}