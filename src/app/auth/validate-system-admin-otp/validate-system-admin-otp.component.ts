import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, FormGroup, Validators, FormArray, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/@core/services/auth.service';
import { AlertService } from 'src/app/@core/services/alert.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { CountdownComponent } from 'ngx-countdown';

@Component({
  selector: 'app-validate-system-admin-otp',
  templateUrl: './validate-system-admin-otp.component.html',
  styleUrls: ['./validate-system-admin-otp.component.scss']
})
export class ValidateSystemAdminOtpComponent {
  @ViewChild('cd') private countdown: any = CountdownComponent;

  submitted = false;
  loading = false;
  currentOTP: any = '';
  public isDisabledResendotp: boolean = true

  constructor(
    private commonSvc: CommonService,
    private fb: UntypedFormBuilder,
    private authSvc: AuthService,
    private alertSvc: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private formValidationSvc: FormValidationService
  ) {
    this.commonSvc.setTitle('Login');
  }



  ngOnInit(): void {
    if (this.authSvc.isLoggedIn()) {
      //  this.router.navigate(['/']);
    }
    const logout = this.route.snapshot.queryParamMap.get('logout');
    if (logout) {
      this.logout();
    }
  }

  onOtpChange(e: any) {
    console.log(e);
    this.currentOTP = e;
  }


  validateOTP() {
    this.submitted = true;
    this.loading = true;

    let postData = { otp: this.currentOTP, otpKey: localStorage.getItem('system_admin_otp_key') };
    this.authSvc.validateSystemAdminOTP(postData).subscribe({
      next: (response: any) => {
        if(response.status==1){
          this.alertSvc.success(response.message);
          localStorage.removeItem('system_admin_otp_key')
          this.router.navigateByUrl('/system-admin/dashboard');
        }else{
          this.loading = false;
          this.alertSvc.error(response.message)
        }
        
        // this.router.navigate([returnUrl]);
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false;}
    });



  }
  resendOtp() {
    this.submitted = true;
    if (localStorage.getItem('system_admin_otp_key') ) {
      let postData = { otpKey: localStorage.getItem('system_admin_otp_key') };
      this.authSvc.resendSystemAdminloginOTP(postData).subscribe({
        next: (response: any) => {
         if ( response.status==1) {
          this.countdown.restart();
          this.isDisabledResendotp = true;      
          this.alertSvc.success(response.message)
         }else{
          this.alertSvc.error(response.message)
         }
        },
        error: () => {  },
        complete: () => {  }
      });
    }else{
      this.alertSvc.error(`Something went wrong`),
      this.router.navigateByUrl(`/auth/system-admin-login`)
    }
   
  }
  handleEvent(e: any) {
    if (e.action == 'done') {
      this.isDisabledResendotp = false;
    }
  }
  logout() {
    this.authSvc.logout();
  }
}
