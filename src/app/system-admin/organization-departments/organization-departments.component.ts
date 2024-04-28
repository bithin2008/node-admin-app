import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
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
import * as _ from "lodash";
@Component({
  selector: 'app-organization-departments',
  templateUrl: './organization-departments.component.html',
  styleUrls: ['./organization-departments.component.scss']
})
export class OrganizationDepartmentsComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  orgDepartmentForm: any;
  selectedOrg: any = '';
  sortBy: any;
  sortDirection: boolean = false;
  orgList: any = [];
  public submitted!: boolean;
  public events: any[] = [];
  public orgDepartmentList: any = [];
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
    this.getOrgDepartmentList();
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
    private cdRef: ChangeDetectorRef,
    private formValidationSvc: FormValidationService
  ) {
    this.commonSvc.setTitle('OrgUsers');
  }

  async ngOnInit(): Promise<void> {
    // this.getOrgDepartmentList();
    this.orgList = await this.getOrganizationList();
    this.getOrgDepartmentList();
  }

  get f() { return this.orgDepartmentForm.controls; }

  getOrgDepartmentList() {
    this.apiSvc.post(`${AppConfig.apiUrl.systemAdmin.getOrgDepartments}?page=${this.first}&limit=${this.itemPerPage}`, { orgId: this.selectedOrg }).subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.orgDepartmentList = val?.data;
        this.loading = false;
      }
    });
  }

  changeOrganization() {
    this.getOrgDepartmentList();
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrgDepartmentList();
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

  openAddEditDepartmentModal(template: TemplateRef<any>, obj: any) {
    // this.orgList = await this.getOrganizationList();
    this.orgDepartmentForm = this.fb.group({
      orgId: ['', [Validators.required]],
      departmentName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      description: [''],
      activeStatus: ['1', [Validators.required]]
    })
    this.modalRef = this.mdlSvc.show(template);
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {
        this.orgDepartmentForm.patchValue({
          orgId: obj.organization.org_id,
          departmentName: obj.department_name,
          description: obj.description,
          activeStatus: obj.active_status.toString()
        });
      }, 250);

    }
  }

  openViewDepartmentModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'view-modal',backdrop:'static' });
    this.viewObj = obj
  }

  openEditDepartmentModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditDepartmentModal(template, obj);
    }, 200);
  }



  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.orgDepartmentForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateOrgDepartment}/${this.editObj.department_id}`, this.orgDepartmentForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgDepartmentList();
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
        this.apiSvc.post(AppConfig.apiUrl.systemAdmin.createOrgDepartment, this.orgDepartmentForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgDepartmentList();
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
      this.formValidationSvc.validateAllFormFields(this.orgDepartmentForm);
    }

  }

  deleteDepartment(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.department_name} department ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.systemAdmin.deleteOrgDepartment}/${obj.department_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getOrgDepartmentList();
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

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.department_name} Department ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.toggleOrgDepartmentStatus}/${obj.department_id}`, { 'activeStatus': ev.target.checked ? 1 : 0 }).subscribe({
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
      } else {
        obj.active_status = previousActiveStatus;
        this.cdRef.detectChanges();
      }
    }).catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  }
}
