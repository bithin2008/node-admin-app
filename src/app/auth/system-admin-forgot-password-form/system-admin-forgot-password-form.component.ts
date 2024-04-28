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
  selector: 'app-system-admin-forgot-password-form',
  templateUrl: './system-admin-forgot-password-form.component.html',
  styleUrls: ['./system-admin-forgot-password-form.component.scss']
})
export class SystemAdminForgotPasswordFormComponent implements OnInit {

  submitted = false;
  loading = false;

  constructor(
    private commonSvc: CommonService,
    private apiSvc: ApiService,
    private alertSvc: AlertService,
    private fb: UntypedFormBuilder,
    private formValidationSvc: FormValidationService,
    private router: Router
  ) {
    this.commonSvc.setTitle('Forgot Password');
  }

  ngOnInit(): void {
  }

  fpForm = this.fb.group({
    email: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.validEmail]],
  });

  get f() { return this.fpForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.fpForm.valid) {


      const postData = this.fpForm.value;
      this.apiSvc.post(AppConfig.apiUrl.systemAdmin.systemAdminForgotPasswordLink, postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.formValidationSvc.validateAllFormFields(this.fpForm);
            this.alertSvc.success(response.message);
            this.fpForm.reset();
            this.fpForm.clearValidators();
            this.submitted = false;
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

    }

  }
  ngAfterViewInit() {
    this.formValidationSvc.forms();
  }

}
