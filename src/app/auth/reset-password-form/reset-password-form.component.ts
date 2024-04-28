import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, NgForm, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
  providers: [FormValidationService]
})
export class ResetPasswordFormComponent implements OnInit {
  password: string = '';
  strongPassword = false;
  submitted = false;
  loading = false;
  fogotPassToken:any;
  passwordType: boolean = false;
  confirmPasswordType: boolean = false;
  public enablePasswordStrength:boolean=false;


  isEightDigitsValid: string = '';
  isLowercaseValid: string = '';
  isUppercaseValid: string = '';
  isNumberValid: string = '';
  isSpecialValid: string = '';
  isAllValid: string = '';


  constructor(
    private commonSvc: CommonService,
    private fb: UntypedFormBuilder,
    private formValidationSvc: FormValidationService,
    private alertSvc: AlertService,
    private apiSvc: ApiService,
    private router: Router,
    private actvRoute: ActivatedRoute,

  ) {
    this.commonSvc.setTitle('Reset Password');
    localStorage.removeItem('token');
    this.actvRoute.params.subscribe((params: any) => {
      this.fogotPassToken = params.fogotpasstoken
    });
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    const myInput:any = document.getElementById('confirmPassword');
      myInput.onpaste = (e: { preventDefault: () => any; }) => e.preventDefault();
      this.formValidationSvc.forms();

  }
  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
  }

  onBlurPassword(){
    if (this.isAllValid == 'Pass') {
      this.enablePasswordStrength=false;
    }
    console.log('this.enablePasswordStrength')
  }

  onFocusPassword(){
    if(this.f['password'].value){
      this.enablePasswordStrength=true;
    }
  }

  resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, this.formValidationSvc.notEmpty,this.formValidationSvc.matchValidator('confirmPassword', true)]],
    confirmPassword: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.matchValidator('password')]]
  });

  get f() { return this.resetPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.resetPasswordForm.valid  && this.isAllValid == 'Pass') {
      const postData:any= {
        new_password:this.resetPasswordForm.value.password,
        password_key:this.fogotPassToken
      }      
      this.apiSvc.post(AppConfig.apiUrl.orgAdmin.updateFogotPassword, postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertSvc.success(response.message);
            this.resetPasswordForm.reset();
            this.isEightDigitsValid = '';
            this.isLowercaseValid = '';
            this.isUppercaseValid = '';
            this.isNumberValid = '';
            this.isSpecialValid = '';
            this.isAllValid = '';
            this.router.navigate(['/auth/login']);
          }else{
            this.alertSvc.error(response.message);
          //  this.router.navigate(['/auth/forgot-password']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.resetPasswordForm);
    }

  }


  checkPassword() {
    this.password = this.f['password'].value;
    if(this.f['password'].value){
      this.enablePasswordStrength=true;
    }

    this.isEightDigitsValid = this.password.length >= 8 ? 'Pass' : 'Fail';
    this.isLowercaseValid = /[a-z]/.test(this.password) ? 'Pass' : 'Fail';
    this.isUppercaseValid = /[A-Z]/.test(this.password) ? 'Pass' : 'Fail';
    this.isNumberValid = /[0-9]/.test(this.password) ? 'Pass' : 'Fail';
    this.isSpecialValid =  /[`~!@#$%^&*()_=+\-{}\[\]\\|;:'",.<>/?]/.test(this.password) ? 'Pass' : 'Fail';

    this.isAllValid =
      this.isEightDigitsValid === 'Pass' &&
      this.isLowercaseValid === 'Pass' &&
      this.isUppercaseValid === 'Pass' &&
      this.isNumberValid === 'Pass' &&
      this.isSpecialValid === 'Pass'
        ? 'Pass'
        : 'Fail';
  }



  // $(".pword").on("focusout", function() {
  //     $(".tooltip").fadeOut('fast', function () { 
  
  //     $(".passfail ").html('<span class="fail">Fail</span>');
  //     $(".checkmark").hide();
  //     });
  // });

}
