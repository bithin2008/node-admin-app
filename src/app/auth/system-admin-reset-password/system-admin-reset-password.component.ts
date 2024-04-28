import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AlertService } from 'src/app/@core/services/alert.service';
import { AuthService } from 'src/app/@core/services/auth.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { CustomValidators } from 'src/app/@utils/const/customValidators';

@Component({
  selector: 'app-system-admin-reset-password',
  templateUrl: './system-admin-reset-password.component.html',
  styleUrls: ['./system-admin-reset-password.component.scss'],
  providers: [FormValidationService]
})
export class SystemAdminResetPasswordComponent {
  strongPassword = false;
  submitted = false;
  loading = false;
  systemAdminToken: any = '';
  passwordType: boolean = false;
  conPasswordType: boolean = false;
  enablePasswordStrength:boolean=false;


 password: string = '';
  isEightDigitsValid: string = '';
  isLowercaseValid: string = '';
  isUppercaseValid: string = '';
  isNumberValid: string = '';
  isSpecialValid: string = '';
  isAllValid: string = '';

  constructor(
    private commonSvc: CommonService,
    private alertSvc: AlertService,
    private authSvc: AuthService,
    private fb: UntypedFormBuilder,
    private formValidationSvc: FormValidationService,
    private actvRoute: ActivatedRoute,
    private router: Router
  ) {
    this.commonSvc.setTitle('Reset Password');
    localStorage.removeItem('token');
    this.actvRoute.params.subscribe((params: any) => {
      this.systemAdminToken = params.systemadmintoken
    });
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    const myInput:any = document.getElementById('confirmPassword');
      myInput.onpaste = (e: { preventDefault: () => any; }) => e.preventDefault();
      this.formValidationSvc.forms();
  }
  fpForm = this.fb.group({
    password: ['', [Validators.required, this.formValidationSvc.notEmpty,this.formValidationSvc.strongPassword, this.formValidationSvc.matchValidator('confirmPassword', true)]],
    confirmPassword: ['', [Validators.required, this.formValidationSvc.notEmpty,this.formValidationSvc.strongPassword, this.formValidationSvc.matchValidator('password')]]
  });

  get f() { return this.fpForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.fpForm.valid) {
      const postData = {
        password_key: this.systemAdminToken,
        new_password: this.fpForm.controls['password'].value
      }
      this.authSvc.updateSystemAdminPassword(postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.formValidationSvc.validateAllFormFields(this.fpForm);
            this.alertSvc.success(response.message);
            this.router.navigateByUrl('/auth/system-admin-login');           
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
      this.formValidationSvc.validateAllFormFields(this.fpForm);
    }

  }

  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
  }

  onBlurPassword(){
    this.enablePasswordStrength=false;
    console.log('this.enablePasswordStrength');
    
  }

  onFocusPassword(){
    if(this.f['password'].value){
      this.enablePasswordStrength=true;
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
    this.isSpecialValid = /[!@#$%^&*]/.test(this.password) ? 'Pass' : 'Fail';

    this.isAllValid =
      this.isEightDigitsValid === 'Pass' &&
      this.isLowercaseValid === 'Pass' &&
      this.isUppercaseValid === 'Pass' &&
      this.isNumberValid === 'Pass' &&
      this.isSpecialValid === 'Pass'
        ? 'Pass'
        : 'Fail';
  }
}
