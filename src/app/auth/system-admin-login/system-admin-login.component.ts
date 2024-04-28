import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, FormGroup, Validators, FormArray, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/@core/services/auth.service';
import { AlertService } from 'src/app/@core/services/alert.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { CommonService } from 'src/app/@core/services/common.service';

@Component({
  selector: 'app-system-admin-login',
  templateUrl: './system-admin-login.component.html',
  styleUrls: ['./system-admin-login.component.scss'],
  providers: [AuthService, FormValidationService]
})
export class SystemAdminLoginComponent {
  submitted = false;
  loading = false;
  passwordType: boolean = false;
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

  loginForm = this.fb.group({
    email: ['', [Validators.required, this.formValidationSvc.validEmail, this.formValidationSvc.notEmpty]],
    password: ['', [Validators.required, this.formValidationSvc.notEmpty]]
  })

  ngOnInit(): void {   
    if (this.authSvc.isLoggedIn()) {
      //  this.router.navigate(['/']);
    }
    const logout = this.route.snapshot.queryParamMap.get('logout');
    if (logout) {
      this.logout();
    }
  }
  ngAfterViewInit() {
    this.formValidationSvc.forms();
  }
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.loginForm.valid) {
      const postData = this.loginForm.value;
      this.authSvc.authenticateSystemAdmin(postData).subscribe({
        next: (response: any) => {
          if(response.status==1){
            this.alertSvc.success(response.message)
            this.router.navigateByUrl('/auth/validate-system-admin-otp');
          }else{
            this.alertSvc.warning(response.message)
          }
         
        },
        error: () => { this.loading = false; },
        complete: () => {
          this.loading = false;
        }
      });

    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.loginForm);
    }

  }

  logout() {
    this.authSvc.logout();
  }
}
