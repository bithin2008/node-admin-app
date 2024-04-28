import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../@utils/const/app.config';
import { CommonService } from '../@core/services/common.service';
import { Router } from '@angular/router';
import { AuthService } from '../@core/services/auth.service';
import * as moment from 'moment';
@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {
  imgPath = 'assets/img/7.svg';
  currentYear:any='';
  constructor(
    private commonSvc: CommonService,
    private router:Router,
    private authSvc: AuthService,
    ) { 
    this.commonSvc.setTitle('Auth');

    if (this.authSvc.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    if(localStorage.getItem('theme') === 'dark') {
      this.imgPath = 'assets/img/7-dark.svg';
    }   
    this.currentYear=moment().format('YYYY');
  }

  getThemeName(themeName: string) {
    if(themeName === 'dark') {
      this.imgPath = 'assets/img/7-dark.svg';
    } else {
      this.imgPath = 'assets/img/7.svg';
    }
  }

}
