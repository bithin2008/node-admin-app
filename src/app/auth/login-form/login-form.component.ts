import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, FormGroup, Validators, FormArray, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/@core/services/auth.service';
import { AlertService } from 'src/app/@core/services/alert.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  providers: [AuthService, FormValidationService]
})
export class LoginFormComponent implements AfterViewInit  {
  @ViewChild('inputElement') inputElement: ElementRef | any;
  @ViewChild('passwordElement') passwordElement: ElementRef | any;
  submitted = false;
  loading = false;
  input1 = '';
  password1 = '';
  passwordType: boolean = false;
  constructor(
    private commonSvc: CommonService,
    private fb: UntypedFormBuilder,
    private authSvc: AuthService,
    private alertSvc: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private formValidationSvc: FormValidationService
  ) {
    this.commonSvc.setTitle('Login');
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.validEmail]],
    password: ['', [Validators.required, this.formValidationSvc.notEmpty]]
  })

  ngAfterViewInit() {
    this.detectAutofill()
  }

  detectAutofill = () => {
    const input = this.inputElement.nativeElement;
    const pass = this.passwordElement.nativeElement; 
    if (window.getComputedStyle(input, null).getPropertyValue('-webkit-text-fill-color') !== 'rgb(0, 0, 0)') {
      input.focus();
      input.parentElement.classList.add('has-value'); // Optionally, add a class to the parent element
      pass.parentElement.classList.add('has-value'); // Optionally, add a class to the parent element
    }

    // Update previous value for the next check
    // input.dataset.previousValue = currentValue;
  }


  ngOnInit(): void {
    const logout = this.route.snapshot.queryParamMap.get('logout');
    if (logout) {
      this.logout();
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.loginForm.valid) {
      this.loginForm.value.email=this.loginForm.value.email.toLowerCase()
      const postData = this.loginForm.value;

      this.authSvc.authenticate(postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.router.navigate(['/auth/validate-otp']);
          } else if (response.status == 2) {
            localStorage.setItem('token', response.token);
            localStorage.removeItem('otp_key');
            localStorage.removeItem('system_admin_token');
            // this.validateUserAuth() // token set as a null  for this comment here validateUserAuth
            this.router.navigate(['/dashboard'], { replaceUrl: true });
             this.alertSvc.success(response.message)
          }else if( response.status == 0){
            this.alertSvc.error(response.message)
          }else {
            this.alertSvc.error(response.message)
          }
        },
        error: (err) => { this.loading = false;
          this.alertSvc.error(err.error.message)
         },
        complete: () => { this.loading = false; }
      });

    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.loginForm);
    }

  }

  validateUserAuth() {
    return new Promise((resolve, reject) => {
      this.authSvc.validateToken().subscribe({
        next: (response: any) => {
          if (response.status == 1) {
           this.sharedService.updateUserData(response);
           resolve(true);
           const jsonData = JSON.stringify(response);
           localStorage.setItem('secret_data', btoa(jsonData));
          } else {
           this.authSvc.logout()
          }
        }, error: (err: HttpErrorResponse) => {
          console.log(err.error.message);
          this.authSvc.logout()
          reject(err.message);
        },
        complete: () => { }
      });
    })
  }
  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     // Get all input elements
  //     var inputElements = document.querySelectorAll('input');
  //     console.log(inputElements);
      
  //     // Iterate over each input element
  //     inputElements.forEach(function (input) {
  //       // Check if the input has the :-webkit-autofill pseudo-class
  //       if (input.matches('input:-webkit-autofill')) {
  //         // Do something for autofilled input
  //         console.log("This input is autofilled:", input);
  //         input.focus();
  //       } else {
  //         // Do something for non-autofilled input
  //         console.log("This input is not autofilled:", input);
  //       }
  //     });
  //     this.formValidationSvc.forms();
  //   }, 550);
  // }

  logout() {
    this.authSvc.logout();
  }

  redirectTo() {
    if (localStorage.getItem('splash') == null) {
      this.router.navigateByUrl("/splash")

    } else {
      this.router.navigate(['/dashboard'], { replaceUrl: true });

    }
  }
}
