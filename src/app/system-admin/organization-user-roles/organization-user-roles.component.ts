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
  selector: 'app-organization-user-roles',
  templateUrl: './organization-user-roles.component.html',
  styleUrls: ['./organization-user-roles.component.scss']
})
export class OrganizationUserRolesComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  orgUserRoleForm: any;
  selectedOrg: any = '';
  sortBy: any;
  sortDirection: boolean = false;
  orgList: any = [];
  public submitted!: boolean;
  public events: any[] = [];
  public orgUserRoleList: any = [];
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};


  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 10;
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  paginate(event: any) {
    this.first = event.page + 1;
    this.getOrgUsersRoleList();
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
  }

  async ngOnInit(): Promise<void> {
    // this.getOrgUsersRoleList();
    this.orgList = await this.getOrganizationList();
    this.getOrgUsersRoleList();
  }

  get f() { return this.orgUserRoleForm.controls; }

  getOrgUsersRoleList() {
    this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getOrgUserRoles}?org_id=${this.selectedOrg}&page=${this.first}&limit=${this.itemPerPage}`,'').subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.orgUserRoleList = val?.data;
        this.loading = false;
      }
    });
  }

  changeOrganization() {
    this.getOrgUsersRoleList();
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrgUsersRoleList();
  }

  resetPagination() {
    this.currentPageIndex = 0;
    this.totalRecords = 0;
    this.itemPerPage = 10;
    this.first = 1;
  }

  getOrganizationList() {
    return new Promise((resolve) => {
      this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getAllOrg}?page=1&limit=100`, '').subscribe({
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

  openAddEditUserRoleModal(template: TemplateRef<any>, obj: any) {
    // this.orgList = await this.getOrganizationList();
    this.orgUserRoleForm = this.fb.group({
      orgId: ['', [Validators.required]],
      roleType: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      description: [''],
      activeStatus: ['1', [Validators.required]]
    })
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg',backdrop: 'static' });
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      // this.orgUserRoleForm.controls['orgId'].disable();
      setTimeout(() => {
        this.orgUserRoleForm.patchValue({
          orgId: obj.org_id,
          roleType: obj.role_type,
          description: obj.description,
          activeStatus: obj.active_status.toString()
        });
      }, 250);
    }
  }

  openViewUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-sm view-modal',backdrop: 'static' });
    this.viewObj = obj
  }

  openEditUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditUserRoleModal(template, obj);
    }, 200);
  }



  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.orgUserRoleForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateOrgUserRoles}/${this.editObj.user_role_id}`, this.orgUserRoleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgUsersRoleList();
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
        this.apiSvc.post(AppConfig.apiUrl.systemAdmin.createOrgUserRoles, this.orgUserRoleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgUsersRoleList();
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
      this.formValidationSvc.validateAllFormFields(this.orgUserRoleForm);
    }

  }

  deleteUserRole(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.role_type} role ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.systemAdmin.deleteOrgUserRoles}/${obj.user_role_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getOrgUsersRoleList();
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
}
