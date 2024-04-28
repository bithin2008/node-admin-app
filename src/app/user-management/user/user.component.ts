import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subscription, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  cropperModalRef?: BsModalRef;
  viewObj: any = {};
  orgUserForm: any;
  selectedOrg: any = '';
  sortBy: any;
  sortDirection: boolean = false;
  orgList: any = [];
  orgRoleList: any = [];
  orgRoleDetails:any
  orgDepartmentList: any = [];
  public submitted!: boolean;
  public events: any[] = [];
  public orgUsersList: any = [];
  public postData = {};
  subscription !: Subscription;
  loading: boolean = false;
  isEdit: boolean = false;
  filterByDeptId='0'
  filterByRoleId='0'
  editObj: any = {};
  maxDate: any;
  userProfileImage: any;
  sortField: string = 'org_user_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;

  // Pagination Config
  paginationObj={
    first:1,
    // The number of elements in the page
    limit:50,
    // The total number of elements
    total:10,
    // The total number of pages
    totalPages:3,
    // The current page number
    currentPage:1,
  };
  
  itemPerPageDropdown = [5,10, 20, 30, 50, 100, 150, 200,300];
  searchKeyword: any = '';
  advanceFilter: any
  advancedSearchConfig: any = {
    inputConfig: [
      {isDisplay:true , propertyName:'filterDept', value:'', placeholder:'Select',label:'Department Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      {isDisplay:true , propertyName:'filterrole', value:'', placeholder:'Select',label:'Role Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},

    ]

  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
    this.advanceFilter = event.searchQuery
    // console.log(this.advanceFilter);
    this.getOrgUserList();
  }
  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if(this.paginationObj.limit!==event.rows){
      this.paginationObj.limit=event.rows
    }
    this.router.navigate(['/user-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getOrgUserList();
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
  permissionObj={
    view:false,
    add:false,
    edit:false,
    delete:false
  }as any;
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef,
    private sharedService:SharedService,
    private activatedRoute:ActivatedRoute,
  ) {
    this.commonSvc.setTitle('Manage Users');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // this.activatedRoute.data.subscribe((data:any) => {
    //   const subModuleDetails = data['subModuleDetails'];      
    //   if (subModuleDetails) {
    //     this.sharedService.updateSubmoduleDetails(subModuleDetails);
    //     let combArr=subModuleDetails.permission_details.combination.split(',');
    //     this.permissionObj = {
    //       view: combArr[0] === '1',
    //       add: combArr[1] === '1',
    //       edit: combArr[2] === '1',
    //       delete: combArr[3] === '1'
    //     };        
    //   }
    // });
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
  }

  async ngOnInit(): Promise<void> {
    // this.getOrgUserList();
  this.getOrgUserList();
    this.getOrgRoleList();
    this.getOrgDepartmentList()
  }
  ngAfterViewInit() {
    this.formValidationSvc.forms();
  }
  get f() { return this.orgUserForm.controls; }

  getOrgUserList() {
    // console.log(typeof this.filterByRoleId);
    
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsers}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}${this.advanceFilter?this.advanceFilter:''}`, '').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.orgUsersList = val?.data;
      }
    });
  }

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
      this.alertService.warning('File size exceeds 2MB',);
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
      this.alertService.warning('Only suported png format',);
      return
    }
  }
  imageCropped(event: any) {
    if (this.initialState.initialState)
      this.initialState.initialState['croppedImage'] = event.base64;
  }


  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrgUserList();
  }

  resetPagination() {
    this.paginationObj = {
      first: 0,
      currentPage: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    };
  }


  getOrgRoleList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getRoles}?active_status=1&sortField=role_type&sortOrder=ASC`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orgRoleList = response?.data
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='filterrole') {
              this.orgRoleList.forEach((el:any) => {
                element.data.push({key:el.role_type,value:el.user_role_id})
              });
            }
          });
        }
      },
      error: (e) => { },
    });
  }

  getOrgDepartmentList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgDepartments}?active_status=1&sortField=department_name&sortOrder=ASC`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orgDepartmentList = response?.data;
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='filterDept') {
              this.orgDepartmentList.forEach((el:any) => {
                element.data.push({key:el.department_name,value:el.department_id})
              });
            }
          });
        } else {
        }
      },
      error: () => {
      },
    });
  }

  async openAddEditUserModal(template: TemplateRef<any>, obj: any) {
    this.orgUserForm = this.fb.group({
      userRoleId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      firstName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      lastName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      emailId: ['', [Validators.required, this.formValidationSvc.validEmail]],
      mobile: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      gender: ['1', Validators.required],
      dateOfBirth: [''],
      joiningDate: [''],
      residentialPhone: ['', [this.formValidationSvc.phoneNumberUS]],
      profileImage: [''],
      zip: ['', [Validators.minLength(5), this.formValidationSvc.numericOnly]],
      city: [''],
      state: [''],
      address1: ['', [Validators.required]],
      address2: [''],
      activeStatus: ['1', Validators.required],
    })

    this.modalRef = this.mdlSvc.show(template, { class: 'modal-xl', backdrop: 'static' });
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      this.orgUserForm.patchValue({
        userRoleId: obj.user_role_id,
        departmentId: obj.department_id,
        firstName: obj.first_name,
        lastName: obj.last_name,
        emailId: obj.email,
        mobile: this.commonSvc.setUSFormatPhoneNumber(obj.mobile),
        gender: JSON.stringify(obj.gender),
        dateOfBirth: obj.date_of_birth?new Date(obj.date_of_birth):null,
        joiningDate: obj.joining_date?new Date(obj.joining_date):null,
        residentialPhone: this.commonSvc.setUSFormatPhoneNumber(obj?.residential_phone),
        zip: obj.zip==''?null:obj.zip,
        city: obj.city,
        state: obj.state,
        address1: obj?.address1,
        address2: obj?.address2,
        activeStatus: obj.active_status.toString()
      });
    }
    this.formValidationSvc.forms();
  }

  changePhoneFormat(e: any) {
    this.orgUserForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  changeResidancePhoneFormat(e: any) {
    this.orgUserForm.controls['residentialPhone'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  closeAddEditUserModal() {
    this.submitted = false;
    this.orgUserForm.reset();
    this.modalRef?.hide();
    this.isEdit = false;
    this.editObj = {};
    this.userProfileImage = null 
    this.loading=false;
  }

  openViewUserModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-lg view-modal',backdrop: 'static' });
    this.viewObj = obj;
  }

  openEditUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditUserModal(template, obj);
    }, 200);
  }

  changeZip(e: any) {
    if (e.target.value.toString().length > 4) {
      this.apiSvc.post(AppConfig.apiUrl.locationByZip, { zip: e.target.value.toString() }).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);
            this.orgUserForm.controls['state'].setValue(response.data.state);
            this.orgUserForm.controls['city'].setValue(response.data.city);
            this.formValidationSvc.forms();

          }
        },
        error: (er) => {
          this.alertService.error(er);
        },
        complete: () => {
        }
      });
    }else{
      e.preventDefault();
    }
  }


  onSubmit() {
    this.submitted = true;
    if (this.orgUserForm.valid) {
      this.loading = true;
      this.orgUserForm.value.mobile = this.commonSvc.convertToNormalPhoneNumber(this.orgUserForm.value.mobile)
      this.orgUserForm.value.residentialPhone = this.commonSvc.convertToNormalPhoneNumber(this.orgUserForm.value.residentialPhone)

      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.updateOrgUser}/${this.editObj.org_user_id}`, this.orgUserForm.value).pipe(
          switchMap((response: any) => {
            const observables = [];
            if (this.userProfileImage) {
              observables.push(this.updateOrgUserProfileImage(this.editObj.org_user_id));
            } else {
              // If this.userProfileImage is not set, provide a dummy observable
              observables.push(of({ status: 1 })); // Adjust the response as needed
            }
        
            return forkJoin(observables).pipe(
              map(([updateProfileImageResponse]) => ({
                updateOrgUserResponse: response,
                updateProfileImageResponse,
              }))
            );
          })
        ).subscribe({
          next: (responses: any) => {
            if (responses.updateOrgUserResponse.status == 1 && responses.updateProfileImageResponse.status == 1) {
              this.alertService.success(responses.updateOrgUserResponse.message);
              this.closeAddEditUserModal();
              this.getOrgUserList()
            } else {
              this.alertService.error(responses.updateOrgUserResponse.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        });
      } else {
        this.apiSvc.post(AppConfig.apiUrl.orgAdmin.createOrgUser, this.orgUserForm.value).pipe(
          switchMap((response: any) => {
            // Here, you have access to response.key
            const observables = [];

            if (this.userProfileImage) {
              observables.push(this.updateOrgUserProfileImage(response.key));
            } else {
              // If this.userProfileImage is not set, provide a dummy observable
              observables.push(of({ status: 1 })); // Adjust the response as needed
            }
  
            return forkJoin(observables).pipe(
              map(([updateProfileImageResponse]) => ({
                createOrgUserResponse: response,
                updateProfileImageResponse,
              }))
            );
          })
        ).subscribe({
          next: (responses: any) => {
            console.log(responses);
            
            if (responses.createOrgUserResponse.status === 1 && responses.updateProfileImageResponse.status === 1) {
              this.alertService.success(responses.createOrgUserResponse.message);
              this.closeAddEditUserModal();
              this.getOrgUserList()
            } else {
              this.alertService.error(responses.createOrgUserResponse.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        });
       
      }
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.orgUserForm);
    }

  }
  updateOrgUserProfileImage(org_user_id: any): Observable<any> { // Add the return type
    if (!this.userProfileImage) {
      return of(null); // Return an observable to continue the chain
    }
  
    const formData = new FormData();
    formData.append('profile_image', this.userProfileImage.blob, 'image.png');
  
    // Make the API call to update the user profile image
    return this.apiSvc.fileupload(`${AppConfig.apiUrl.orgAdmin.updateOrgUserProfieImage}/${org_user_id}`, formData).pipe(
      catchError((error) => {
        // Handle errors from the second API call
        this.alertService.error(error);
        return of(null); // Return an observable to continue the chain
      }),
      tap(() => {
        // Handle success
        var el: any = document.getElementById('profile_image');
        el.value = '';
        this.userProfileImage = {};
      })
    );
  }
  

  changeActivationStatus(ev: any, obj: any) {
    if (this.permissionObj?.edit) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.first_name} user ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.toggleUserStatus}/${obj.org_user_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
          },
          complete: () => {
            this.getOrgUserList()
          }
        });
      }
      }).catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  }else{
    this.alertService.error(`You are not authorised to do this. `);
  }
  }
   
  updateSorting(columnName: string) {
    // If the same column is clicked again, toggle the sorting order
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // If a new column is clicked, set the new sorting column and reset the sorting order to 'asc'
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    // Call your API endpoint to fetch data with the updated sorting parameters
    this.getOrgUserList();
  }
  searchUser(e: any) {
    const inputValue = e.target.value;
    // Define the minimum length required for calling the function
    const minLengthForCall = 3;
    // Check if the input value starts with a date pattern (e.g., "MM-DD-YYYY")
    const startsWithDatePattern = /^\d{2}-/.test(inputValue);    
    // Determine the minimum length based on whether it starts with a date pattern
    const minLength = startsWithDatePattern ? 10 : minLengthForCall;
    if (inputValue.length >= minLength) {
      this.searchingvalue = inputValue;
      setTimeout(() => {
        this.getOrgUserList()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getOrgUserList()
    }
  }
  getRoleDetails(){
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsers}`, '').subscribe({
      next: (val: any) => {
        this.orgUsersList = val?.data;
      }
    });
  };
  getUserRoleDetails(user_role_id:number){
    if (user_role_id)
    this.orgRoleDetails= this.orgRoleList.filter((e:any)=>e.user_role_id==user_role_id)[0]; 
     
  }

  onInputChange(event: any) {
    let inputValue: any = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    this.orgUserForm.patchValue({
      zip: inputValue
    });
  }
  changeDateOfBirth(e:any){
    if (e) {
      this.formValidationSvc.forms()
    }
  }
  changeJoiningDate(e:any){
    if (e) {
      this.formValidationSvc.forms()
    }
  }
  resetAllFilter(){
    this.searchingvalue='';
    this.filterByRoleId='0';
    this.filterByDeptId='0'
    this.getOrgUserList()
    this.formValidationSvc.forms()

  }
  
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/user-management');
    this.getOrgUserList();
  }
}
