import { Component, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { of, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { SystemAdminApiService } from 'src/app/@core/services/system-admin-api.service';
@Component({
  selector: 'app-organization-users',
  templateUrl: './organization-users.component.html',
  styleUrls: ['./organization-users.component.scss']
})
export class OrganizationUsersComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj:any={};
  orgUserForm: any;
  selectedOrg: any = '';
  sortBy: any;
  sortDirection: boolean = false;
  orgList: any = [];
  orgRoleList: any = [];
  orgDepartmentList: any = [];
  public submitted!: boolean;
  public events: any[] = [];
  public orgUsersList: any = [];
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  maxDate:any;

  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 10;
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  paginate(event: any) {
    this.first = event.page + 1;
    this.getOrgUserList();
  }
  constructor(
    private apiSvc: SystemAdminApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService
  ) {
    this.commonSvc.setTitle('OrgUsers');
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
  }

  async ngOnInit(): Promise<void> {
    // this.getOrgUserList();
    this.orgList = await this.getOrganizationList();
   this.orgUsersList= this.getOrgUserList();
  }

  get f() { return this.orgUserForm.controls; }

  getOrgUserList() {
    this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getOrgUsers}?org_id=${this.selectedOrg}&page=${this.first}&limit=${this.itemPerPage}`).subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.orgUsersList = val?.data;
        this.loading = false;
      }
    });
  }

  changeOrganizationName(){
    this.getOrgUserList();
  }

  async changeOrganization() {
    if(this.f['orgId'].value){
      this.orgUserForm.controls['userRoleId'].enable();
      this.orgUserForm.controls['departmentId'].enable();
      this.orgRoleList = await this.getOrgRoleList();    
      this.orgDepartmentList = await this.getOrgDepartmentList();    
    }else{
      this.orgUserForm.controls['userRoleId'].disable();
      this.orgUserForm.controls['departmentId'].disable();
    }   
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrgUserList();
  }

  resetPagination() {
    this.currentPageIndex = 0;
    this.totalRecords = 0;
    this.itemPerPage = 10;
    this.first = 1;
  }

  getOrganizationList() {
    return new Promise((resolve,reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getAllOrg}?page=1&limit=100`, '').subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            resolve(response?.data);
          } else {
            reject();
          }
        },
        error: () => {
          reject();
        },
      });
    });
  }

  getOrgRoleList() {
    return new Promise((resolve) => {
      this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getOrgUserRoles}?org_id=${this.f['orgId'].value}&page=1&limit=100`, '').subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            resolve(response?.data);
          } else {
            resolve('');
          }
        },
        error: () => {
          resolve('');
        },
      });
    });
  }

  getOrgDepartmentList() {
    return new Promise((resolve) => {
      this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getOrgDepartments}?page=1&limit=100`,{orgId:this.f['orgId'].value}).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            resolve(response?.data);
          } else {
            resolve('');
          }
        },
        error: () => {
          resolve('');
        },
      });
    });
  }

  async openAddEditUserModal(template: TemplateRef<any>, obj: any) {  
   // 
    this.orgUserForm = this.fb.group({
      orgId: ['', [Validators.required]],
      userRoleId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      firstName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      lastName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      emailId: ['', [Validators.required, this.formValidationSvc.validEmail]],
      mobile: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      gender: ['1', Validators.required],
      dateOfBirth: ['', Validators.required],
      joiningDate: ['', Validators.required],
      residentialPhone: ['', [this.formValidationSvc.phoneNumberUS]],
      profileImage: [''],
      zip: ['', [Validators.required, Validators.minLength(5), this.formValidationSvc.numericOnly]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: [''],
      activeStatus: ['1', Validators.required]
    })

    this.orgUserForm.controls['userRoleId'].disable();
    this.orgUserForm.controls['departmentId'].disable();
    this.orgUserForm.controls['city'].disable();
    this.orgUserForm.controls['state'].disable();
    this.modalRef = this.mdlSvc.show(template, { class: 'modal-lg',backdrop:'static' });
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      this.orgUserForm.controls['orgId'].disable();
      this.orgUserForm.patchValue({
        orgId: obj.org_id,
        userRoleId: obj.user_role_id,
        roleType: obj.role_type,
        description: obj.description,
        activeStatus: obj.active_status.toString()
      });
    }
  }

  changePhoneFormat(e: any) {
    this.orgUserForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  changeResidancePhoneFormat(e: any) {
    this.orgUserForm.controls['residentialPhone'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  closeAddEditUserModal(){
    this.submitted=false;
    this.orgUserForm.reset();
    this.modalRef?.hide();
  }

  openViewUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-sm view-modal',backdrop: 'static' });
    this.viewObj = obj
  }

  openEditUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditUserModal(template, obj);
    }, 200);
  }

  changeZip(e: any) {
    console.log(e);
    if (e.target.value.toString().length > 4) {
      this.loading = true;
      this.apiSvc.post(AppConfig.apiUrl.locationByZip, { zip: e.target.value.toString() }).subscribe({
        next: (response: any) => {
          if (response.status == 1) {         
            this.alertService.success(response.message);
            this.orgUserForm.controls['state'].setValue(response.data.state);
            this.orgUserForm.controls['city'].setValue(response.data.city);
            this.loading = false;
          }
        },
        error: (er) => {
          this.loading = false;
          this.alertService.error(er);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }


  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.orgUserForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateOrgUserRoles}/${this.editObj.user_role_id}`, this.orgUserForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgUserList();
              this.loading = false;
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        this.apiSvc.post(AppConfig.apiUrl.systemAdmin.createOrgUser, this.orgUserForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
             // this.getOrgUserList();
              this.loading = false;
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.orgUserForm);
    }

  }

  deleteUserRole(obj: any) {
    return
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.role_type} role ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.systemAdmin.deleteOrgUserRoles}/${obj.user_role_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getOrgUserList();
              this.loading = false;
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    })
      .catch(() => { });
  }

  changeActivationStatus(ev: any, roleId: any) {
    return
    console.log('ev', ev.target.checked);
    this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.toggleOrgUserRoleStatus}/${roleId}`, { 'activeStatus': ev.target.checked ? 1 : 0 }).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          this.loading = false;
        } else {
          this.alertService.error(response.message);
        }
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
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
}
