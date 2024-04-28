import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from 'src/app/@core/services/navigation.service';
import { CommonService } from '../@core/services/common.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { SharedService } from '../@core/services/shared.service';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { ApiService } from '../@core/services/api.service';
import { FormValidationService } from '../@core/services/form-validation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConfig } from '../@utils/const/app.config';
import { AlertService } from '../@core/services/alert.service';
import { ImageCropperWrapperComponent } from '../@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../@core/services/auth.service';
import * as moment from 'moment';
declare var bootstrap: any;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements AfterViewInit,OnInit  {
  availableClasses: string[] = ["sidebar-hide", "sidebar-show"];
  currentClassIdx: number = 0;
  status: boolean = false;
  profileDetails:any
  
  password: string = '';
  strongPassword = false;
  submitted = false;
  submitteEditProfile = false;
  loading = false;
  fogotPassToken:any;
  oldPasswordType: boolean = false;
  newPasswordType: boolean = false;
  confirmPasswordType: boolean = false;
  today:any = moment();
  maxDate:any
  minDate:any


  isEightDigitsValid: string = '';
  isLowercaseValid: string = '';
  isUppercaseValid: string = '';
  isNumberValid: string = '';
  isSpecialValid: string = '';
  isAllValid: string = '';
  constructor(
    private navService: NavigationService,
     private commonSvc: CommonService,
     private alertSvc: AlertService,
     private shrdSvc:SharedService,
     private apiSvc: ApiService,
     private fb: UntypedFormBuilder,
     private formValidationSvc: FormValidationService,
     private cdRef: ChangeDetectorRef,
     private mdlSvc: BsModalService,
    private authService:AuthService

     ) {
      this.maxDate = new Date(this.today.subtract(18, 'years'));
      const tempDate:any = moment(this.minDate)
      this.minDate = new Date(tempDate.subtract(100, 'years'));
      this.shrdSvc.sharedUserData$.subscribe((response: any) => {
        if (response.data) {
          this.profileDetails=response.data;
          
        }
      })
    // console.log( this.profileDetails);
  
    // this.maxDate = new Date();
    // this.maxDate.setDate(this.maxDate.getDate());
  }
  editProfileForm = this.fb.group({
    first_name: ['', [Validators.required, this.formValidationSvc.notEmpty]],
    last_name: ['', [Validators.required, this.formValidationSvc.notEmpty]],
    email: ['', [Validators.required, this.formValidationSvc.validEmail]],
    mobile: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
    gender: ['1', Validators.required],
    date_of_birth: [''],
    residential_phone: ['', [this.formValidationSvc.phoneNumberUS]],
    zip: ['', [Validators.minLength(5), this.formValidationSvc.numericOnly]],
    city: [''],
    state: [''],
    address1: ['', [Validators.required]],
    address2: [''],
  })
  changePasswordForm = this.fb.group({
    oldPassword: ['', [Validators.required, this.formValidationSvc.notEmpty]],
    newPassword: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.matchValidator('confirmPassword', true)]],
    confirmPassword: ['', [Validators.required, this.formValidationSvc.notEmpty, this.formValidationSvc.matchValidator('newPassword')]]
  });
  get f() { return this.changePasswordForm.controls; }
  get p() { return this.editProfileForm.controls; }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    const myInput:any = document.getElementById('confirmPassword');
      myInput.onpaste = (e: { preventDefault: () => any; }) => e.preventDefault();
     this.resetEditProfile();
  }
  resetEditProfile(){
    this.editProfileForm.reset()
    this.submitteEditProfile=false
   let  profileDetails={...this.profileDetails}
   setTimeout(() => {
    this.editProfileForm.patchValue({
      first_name: profileDetails.first_name,
      last_name: profileDetails.last_name,
      email: profileDetails.email,
      mobile: this.commonSvc.setUSFormatPhoneNumber(profileDetails.mobile),
      gender: profileDetails.gender?JSON.stringify(profileDetails.gender):null,
      date_of_birth: profileDetails.date_of_birth?new Date(profileDetails.date_of_birth):null,
      residential_phone: this.commonSvc.setUSFormatPhoneNumber(profileDetails?.residential_phone),
      zip: profileDetails.zip==''?null:profileDetails.zip,
      city: profileDetails.city,
      state: profileDetails.state,
      address1: profileDetails?.address1?profileDetails?.address1:null,
      address2: profileDetails?.address2,
    });
   }, 100);
   this.formValidationSvc.forms();

   this.cdRef.detectChanges();

  }
  checkPassword() {
    this.password = this.f['newPassword'].value;
    this.isEightDigitsValid = this.password.length >= 8 ? 'Pass' : 'Fail';
    this.isLowercaseValid = /[a-z]/.test(this.password) ? 'Pass' : 'Fail';
    this.isUppercaseValid = /[A-Z]/.test(this.password) ? 'Pass' : 'Fail';
    this.isNumberValid = /[0-9]/.test(this.password) ? 'Pass' : 'Fail';
    this.isSpecialValid = /[`~!@#$%^&*()_=+\-{}\[\]\\|;:'",.<>/?]/.test(this.password) ? 'Pass' : 'Fail';///[!@#$%^&*]/.test(this.password) ? 'Pass' : 'Fail';
    this.isAllValid =
      this.isEightDigitsValid === 'Pass' &&
      this.isLowercaseValid === 'Pass' &&
      this.isUppercaseValid === 'Pass' &&
      this.isNumberValid === 'Pass' &&
      this.isSpecialValid === 'Pass'
        ? 'Pass'
        : 'Fail';
  }
  onSubmitChangePassword() {
    this.submitted = true;
    this.loading = true;
    if (this.changePasswordForm.valid && this.isAllValid == 'Pass') {
      const postData = {
        old_password: this.changePasswordForm.value.oldPassword,
        new_password: this.changePasswordForm.value.newPassword
      }

      this.apiSvc.post(AppConfig.apiUrl.orgAdmin.changProfilePassword, postData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.changePasswordForm.reset()
            this.alertSvc.success(response.message);
            this.isEightDigitsValid = '';
            this.isLowercaseValid = '';
            this.isUppercaseValid = '';
            this.isNumberValid = '';
            this.isSpecialValid = '';
            this.isAllValid = '';
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
  resetpassForm(){
    this.changePasswordForm.reset()
    this.isEightDigitsValid = '';
    this.isLowercaseValid = '';
    this.isUppercaseValid = '';
    this.isNumberValid = '';
    this.isSpecialValid = '';
    this.isAllValid = '';
    this.submitted = false;

  }
  changePhoneFormat(e: any) {
    this.editProfileForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  changeResidancePhoneFormat(e: any) {
    this.editProfileForm.controls['residential_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }
  changeZip(e: any) {
    if (e.target.value.toString().length > 4) {
      this.apiSvc.post(AppConfig.apiUrl.locationByZip, { zip: e.target.value.toString() }).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertSvc.success(response.message);
            this.editProfileForm.controls['state'].setValue(response.data.state);
            this.editProfileForm.controls['city'].setValue(response.data.city);
            this.formValidationSvc.forms();
          }
        },
        error: (er) => {
       
        },
        complete: () => {
        }
      });
    }else{
      e.preventDefault();
    }
  };
  onSubmitUpdateProfile(){
    this.submitteEditProfile = true;
    if (this.editProfileForm.valid) {
      this.loading = true;
      this.apiSvc.put(AppConfig.apiUrl.orgAdmin.updateProfileInfo, this.editProfileForm.value).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertSvc.success(response.message); 
            this.validateUserAuth();           
          } else{
            this.alertSvc.error(response.message);
            
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
        },
        complete: () => {
          this.submitteEditProfile = false;
          this.loading = false;
        }
      });
    } else {
      this.formValidationSvc.validateAllFormFields(this.editProfileForm);
    }

  }
  public initialState: any = {
    backdrop: 'static',
    initialState: {
      title: 'Modal with component',
      imageChangedEvent: null,
      croppedImage: null,
      imageCropperConfig: {
        canvasWidth: 400,
        canvasHeight: 300,
        cropperMinWidth: 50,
        cropperMinHeight: 50,
        aspectRatio: NaN,
        resizeToWidth: 0,
        maintainAspectRatio: false,
        cropperStaticWidth: false,
        cropperStaticHeight: false,
        onlyScaleDown: false,
        rounded: false,
        showCropper: false,
        format: "png"
      },
    }
  } as any;
  userProfileImage:any
  cropperModalRef?: BsModalRef;

  openImageCropperComponent() {    
    this.userProfileImage = null
    this.initialState.initialState.imageCropperConfig.aspectRatio = 4 / 3
    // this.initialState.initialState.imageCropperConfig.resizeToWidth = 500

    this.cropperModalRef = this.mdlSvc.show(ImageCropperWrapperComponent, this.initialState);
    this.cropperModalRef.content.closeBtnName = 'Close';
    this.cropperModalRef.content.saveCroppedImage.subscribe((result: any) => {
      if (result) {
        this.userProfileImage = result
        console.log('results', result);
        this.updateProfileImage();
      } else {

      }
      const cropImg: any = document.getElementsByClassName('cropImg')
      if (cropImg) {
        [...cropImg].forEach((el: any) => {
          el.value = ''
        });
      }
    })
  }
  fileChangeEvent(event: any, srcType: string): void {
    const fileSize = event.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      this.alertSvc.warning('File size exceeds 2MB',);
      var el: any = document.getElementById(srcType);
      el.value = '';
      return
    }
    let validation: any = this.commonSvc.validatePhotoUpload(event.target.files[0].name, ['png', 'jpg', 'jpeg','webp']);
    if (validation) {
      if (this.initialState.initialState) {
        this.initialState.initialState['imageChangedEvent'] = event;
        this.openImageCropperComponent()
      }
    } else {
      var el: any = document.getElementById(srcType);
      el.value = '';
      this.alertSvc.warning('Only suported png format',);
      return
    }
  }
  imageCropped(event: any) {
    if (this.initialState.initialState)
      this.initialState.initialState['croppedImage'] = event.base64;
  }

  updateProfileImage() { // Add the return type
    if (!this.userProfileImage) {
      this.alertSvc.error('Please select image') // Return an observable to continue the chain
    }
  
    const formData = new FormData();
    formData.append('profile_image', this.userProfileImage.blob, 'image.png');
  
    // Make the API call to update the user profile image
     this.apiSvc.fileupload(`${AppConfig.apiUrl.orgAdmin.updateProfilePhoto}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertSvc.success(response.message);   
            this.validateUserAuth();
  
        } else{
          this.alertSvc.error(response.message);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
      },
      complete: () => {
        var el: any = document.getElementById('proImage');
        el.value = '';
        this.userProfileImage = {};
      }
    });
     
  }
  validateUserAuth() {
      this.authService.validateToken().subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.shrdSvc.updateUserData(response);
          } else {
           this.authService.logout()
          }
        }, error: (err: HttpErrorResponse) => {
          console.log(err.error.message);
        },
        complete: () => { }
      });
  }

  changeDateOfBirth(e:any){
    if (e) {
      this.formValidationSvc.forms()
    }
  }
 
  bsValueChange(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }
}
