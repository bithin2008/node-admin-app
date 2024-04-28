import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { AuthService } from 'src/app/@core/services/auth.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { NavigationService } from 'src/app/@core/services/navigation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  public modalRef?: BsModalRef;
  themeModalRef?: BsModalRef | null;
  public submitted!: boolean;
  public isLoggedIn = false;
  public loading = false;
  public user: any;
  public greetMsg: any;
  public isOpened = true;
  public resolution = 'lg';

  public enablePasswordStrength: boolean = false;

  messagestatus: boolean = false;
  messagestatus2: boolean = false;
  searchstatus: boolean = false;
  profilestatus: boolean = false;

  password: string = '';
  strongPassword = false;
  oldPasswordType: boolean = false;
  newPasswordType: boolean = false;
  confirmPasswordType: boolean = false;

  isEightDigitsValid: string = '';
  isLowercaseValid: string = '';
  isUppercaseValid: string = '';
  isNumberValid: string = '';
  isSpecialValid: string = '';
  isAllValid: string = '';
  isFullScreen: boolean = false;
  userType: any;
  userRole = AppConfig.userRole;

  routeName: any;
  showCreateClaimButton = false;
  showCreatePolicyButton = false;
  constructor(
    private authSvc: AuthService,
    private shrdSvc: SharedService,
    private confrmSvc: ConfirmationDialogService,
    private mdlSvc: BsModalService,
    private alertSvc: AlertService,
    private apiSvc: ApiService,

    private fb: UntypedFormBuilder,
    private formValidationSvc: FormValidationService,
    private router: Router,
    private alertService: AlertService,
    private navService: NavigationService,
    private commonSvc: CommonService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let profileContainer: any = document.getElementsByClassName('profile-dropdown') as HTMLCollectionOf<Element>;
        [...profileContainer].forEach(element => {
          if (element) {
            if (element.classList.contains('show')) {
              setTimeout(() => {
                element.classList.remove('show');
              }, 50);
              this.profilestatus = false;
            }
          }
        });
      }
    });
  }

  public changePasswordForm = this.fb.group({
    oldPassword: ['', [Validators.required, this.formValidationSvc.notEmpty]],
    newPassword: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.strongPassword, this.formValidationSvc.matchValidator('confirmPassword', true)]],
    confirmPassword: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.matchValidator('newPassword')]]
  });

  ngOnInit(): void {
   // this.validateUserAuth();
    // this.isLoggedIn = this.authSvc.isLoggedIn();
    // this.user = this.authSvc.getUser();
    // this.resolution = this.commonSvc.getScreenResolutionBreakPoint()
    this.shrdSvc.sharedUserData$.subscribe((response: any) => {
      if (response.data) {
        this.user = response.data;
        this.userType = response?.data?.user_role_details?.user_role_id
        this.greetMsg = this.getGreeting(this.user.current_time);
        this.routeName = this.router.url;
        // Iterate through the data structure
        for (const module of this.user?.accessable_module_submodules) {
          for (const submodule of module.submodules) {
            if (submodule.route_path === 'claim-management/create-claim') {
              if (this.routeName=='/claim-management/create-claim') {
                this.showCreateClaimButton = false;
                AppConfig.showClaimAddButton=true
              }else{
                this.showCreateClaimButton = true; 
                AppConfig.showClaimAddButton=true
              }
             
            } else if (submodule.route_path === 'policy-management/create-policy') {
              //this.routeName = this.router.url;
              //console.log(34634634,this.routeName);
              if (this.routeName=='/policy-management/create-policy') {
                //console.log(34634634,this.routeName);
                
                this.showCreatePolicyButton = false;
              }else{
                this.showCreatePolicyButton = true; 
              }
            }
          }
        }
       
      }
    })

    this.router.events.subscribe((event) => {
      this.routeName = this.router.url;
      this.shrdSvc.sharedUserData$.subscribe((response: any) => {
        if (response.data) {
          this.user = response.data;
          this.userType = response?.data?.user_role_details?.user_role_id
          this.greetMsg = this.getGreeting(this.user.current_time);
        
          // Iterate through the data structure
          for (const module of this.user?.accessable_module_submodules) {
            for (const submodule of module.submodules) {
              if (submodule.route_path === 'claim-management/create-claim') {
                if (this.routeName=='/claim-management/create-claim') {
                  this.showCreateClaimButton = false;
                  AppConfig.showClaimAddButton=false
                }else{
                  this.showCreateClaimButton = true; 
                  AppConfig.showClaimAddButton=true;
                }
               
              } else if (submodule.route_path === 'policy-management/create-policy') {
                //console.log(this.routeName);
                
                if (this.routeName=='/policy-management/create-policy') {
                  this.showCreatePolicyButton = false;
                }else{
                  this.showCreatePolicyButton = true; 
                }
              }
            }
          }  
        }
      })
    });
    this.changeBrightness();
    
 
  }

  validateUserAuth() {
    return new Promise((resolve, reject) => {
      this.authSvc.validateToken().subscribe({
        next: (response: any) => {
          if (response.status == 1) {
          //  this.shrdSvc.updateUserData(response);
           const jsonData = JSON.stringify(response);
           localStorage.setItem('secret_data', btoa(jsonData));
            resolve(true);
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


  get f() { return this.changePasswordForm.controls; }

  getGreeting(time: any) {
    var currentTime = new Date(time);
    var currentHour = currentTime.getHours();
    if (currentHour < 12) {
      return "Good Morning!";
    } else if (currentHour < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  }

  messages() {
    this.messagestatus = !this.messagestatus;
  }

  messages2() {
    this.messagestatus2 = !this.messagestatus2;
  }
  profile() {
    this.profilestatus = !this.profilestatus;
  }

  clickSearch() {
    this.searchstatus = !this.searchstatus;
  }

  closeSearch() {
    this.searchstatus = false
  }


  toggleSideNav() {
    this.navService.showNav$.subscribe((data) => {
      this.isOpened = data;
    });
    if (!this.isOpened) {
      this.navService.showNav();
    } else {
      this.navService.hideNav();
    }
  }
  // Brightness Controller //
  changeBrightness() {
    const rangeInput: any = document.getElementById("range");
    if (rangeInput) {
      let container: any = document.getElementsByClassName("brightness")[0];

      rangeInput.addEventListener("change", function () {
        container.style.filter = "brightness(" + rangeInput.value + "%)";
      });
    }
  }

  ngAfterViewInit() {

    document.addEventListener('mouseup', (e: any) => {

      //CLOSE NOTIFICATION BOX OUT SIDE CLICK
      let notificationContainer: any = document.getElementsByClassName('notification__box') as HTMLCollectionOf<Element>;
      [...notificationContainer].forEach(element => {
        if (element) {
          if (!element.contains(e.target) && element.classList.contains('show')) {
            setTimeout(() => {
              element.classList.remove('show');
            }, 50);
            this.messagestatus = false;
            this.messagestatus2 = false;
          }
        }
      });

      //CLOSE PROFILE BOX OUT SIDE CLICK
      let profileContainer: any = document.getElementsByClassName('profile-dropdown') as HTMLCollectionOf<Element>;
      [...profileContainer].forEach(element => {
        if (element) {
          if (!element.contains(e.target) && element.classList.contains('show')) {
            setTimeout(() => {
              element.classList.remove('show');
            }, 50);
            this.profilestatus = false;
          }
        }
      });


    });
  }



  closeChangePasswordModal() {
    this.modalRef?.hide();
  }

  openChangePasswordModal(template: TemplateRef<any>) {
    this.modalRef = this.mdlSvc.show(template, { backdrop: true });
  }

  onChangePassword() {
    this.submitted = true;
    this.loading = true;
    if (this.changePasswordForm.valid) {
      const postData = {
        old_password: this.changePasswordForm.value.oldPassword,
        new_password: this.changePasswordForm.value.newPassword
      }
      this.apiSvc.post(AppConfig.apiUrl.systemAdmin.changProfilePassword, postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.changePasswordForm.reset()
            this.alertSvc.success(response.message);
            this.modalRef?.hide();
          } else {
            this.alertSvc.error(response.message);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
        },
        complete: () => {
          this.submitted = false;
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.changePasswordForm);
    }

  }

  checkPassword() {
    this.password = this.f['newPassword'].value;
    if (this.f['newPassword'].value) {
      this.enablePasswordStrength = true;
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

  onBlurPassword() {
    this.enablePasswordStrength = false;
  }

  onFocusPassword() {
    if (this.f['newPassword'].value) {
      this.enablePasswordStrength = true;
    }
  }

  logout() {
    console.log(3424); 
     this.profilestatus = false;
    this.confrmSvc.confirm('', `Are you sure want to Logout?`, 'Yes', 'No').then((res) => {
      if (res) {
        console.log(res);
        let url = this.user?.is_system_admin == 1 ? AppConfig.apiUrl.systemAdmin.systemAdminLogout : AppConfig.apiUrl.logout;
        this.apiSvc.post(url, {}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
               this.alertService.success(response.message);
              localStorage.clear();
              if (this.user?.is_system_admin == 1) {
                this.router.navigateByUrl('/auth/system-admin-login');
              } else {
                setTimeout(() => {
                  this.router.navigate(['/'])
                }, 100);
              }
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            //window.location.reload()
            this.loading = false;
          }
        });
      }
    }).catch(() => { });
  }

  openModalPrefrence(template: TemplateRef<any>) {
    this.themeModalRef = this.mdlSvc.show(template, { class: 'modal-right theme-modal', backdrop: 'static' });
    const getRootElem = document.documentElement;

    // get and set color mode
    const dataModeBtns: any = document.querySelectorAll('.color--mode [data-mode]');
    [...dataModeBtns].forEach((dataModeBtn) => {
      dataModeBtn.addEventListener('click', function () {
        let currentMode = dataModeBtn.getAttribute('data-mode');
        // localStorage.setItem('screenModeNightTokenState', currentMode);
        getRootElem.setAttribute('data-mode', currentMode);
        // getRootElem.setAttribute('data-theme', 'default');
      });
    });


    const dataThemeBtns: any = document.querySelectorAll('.theme--mode [data-theme]');
    [...dataThemeBtns].forEach((dataThemeBtn) => {
      dataThemeBtn.addEventListener('click', function () {
        let currentTheme = dataThemeBtn.getAttribute('data-theme');
        // localStorage.setItem('screenModeNightTokenState', currentTheme);
        getRootElem.setAttribute('data-theme', currentTheme);
      });
    });

  }

  closeModalPrefrence() {
    this.themeModalRef?.hide();
  }


  // toggle fullscreen mode
  tglFullScreenMode(clickRef: any) {
    let rootElm: any = document.documentElement;
    let btnIco: any = clickRef.target;

    if (this.isFullScreen) {
      document.exitFullscreen();
      btnIco.classList.remove('pi-window-minimize');
      btnIco.classList.add('pi-window-maximize');
      this.isFullScreen = false;
    }
    else {
      rootElm.requestFullscreen();
      btnIco.classList.remove('pi-window-maximize');
      btnIco.classList.add('pi-window-minimize');
      this.isFullScreen = true;
    }
  }
}
