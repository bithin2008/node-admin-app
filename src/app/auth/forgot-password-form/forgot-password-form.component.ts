import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, NgForm, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss']
})
export class ForgotPasswordFormComponent implements OnInit {

  submitted = false;
  loading = false;

  constructor(
    private commonSvc: CommonService,
    private alertSvc: AlertService,
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private formValidationSvc: FormValidationService,
    private router: Router
  ) {
    this.commonSvc.setTitle('Forgot Password');
  }

  ngOnInit(): void {
  }

  fpForm = this.fb.group({
    emailId: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.validEmail]],
  });
  ngAfterViewInit() {
    this.formValidationSvc.forms();
  }
  get f() { return this.fpForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.fpForm.valid) {
      const postData = this.fpForm.value;
      this.apiSvc.post(AppConfig.apiUrl.orgAdmin.genForgotPassLink, postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertSvc.success(response.message);            
          } else{
            this.alertSvc.error(response.message);
          }

        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
        },
        complete: () => {
          this.submitted = false;
          this.fpForm.reset()
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.fpForm);
    }

  }

}
