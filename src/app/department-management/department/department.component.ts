import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  orgDepartmentForm: any;
  sortBy: any;
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  public orgDepartmentList: any = [];
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  sortField: string = 'department_id'; // Default sorting field
  sortOrder: string = 'desc'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;

  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
    permissionObj:any
  itemPerPageDropdown = [5,10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if(this.paginationObj.limit!==event.rows){
      this.paginationObj.limit=event.rows
    }
    this.router.navigate(['/department-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getOrgDepartmentList();
  }
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
    private activatedRoute:ActivatedRoute,
    private sharedService:SharedService

  ) {
    this.commonSvc.setTitle('Manage Departments');
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
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
    //   console.log('subModuleDetails',subModuleDetails);
      
    //   if (subModuleDetails) {
    //     this.sharedService.updateSubmoduleDetails(subModuleDetails);
    //     let combArr = subModuleDetails.permission_details.combination.split(',');
    //     this.permissionObj = {
    //       view: combArr[0] === '1',
    //       add: combArr[1] === '1',
    //       edit: combArr[2] === '1',
    //       delete: combArr[3] === '1'
    //     };
    //   }
    // });
  }

  async ngOnInit(): Promise<void> {
    this.getOrgDepartmentList();
  }

  get f() { return this.orgDepartmentForm.controls; }

  getOrgDepartmentList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgDepartments}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`, '').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.orgDepartmentList = val?.data;
        this.loading = false;
      }
    });
  }
  ngAfterViewInit() {
  }


  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrgDepartmentList();
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


  openAddEditDepartmentModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    this.orgDepartmentForm = this.fb.group({
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


    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);
   

  }
  closeAddEditDepartmentModal() {
    this.modalRef?.hide();
    this.submitted = false;
    this.loading = false;
    this.orgDepartmentForm.reset();
    this.isEdit = false;
    this.editObj = {}
  }
  openViewDepartmentModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template,{ class: 'view-modal',backdrop: 'static' });
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
        this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.updateOrgDepartment}/${this.editObj.department_id}`, this.orgDepartmentForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.closeAddEditDepartmentModal()
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
        this.apiSvc.post(AppConfig.apiUrl.orgAdmin.createOrgDepartment, this.orgDepartmentForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.closeAddEditDepartmentModal()
              this.getOrgDepartmentList();
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
        this.apiSvc.delete(`${AppConfig.apiUrl.orgAdmin.deleteOrgDepartment}/${obj.department_id}`).subscribe({
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
    if (this.permissionObj?.edit) {

    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.department_name} Department ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.toggleOrgDepartmentStatus}/${obj?.department_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
            } else {
              this.alertService.error(response.message);
            }
          }, error: () => { }, complete: () => { this.getOrgDepartmentList() }
        });
      } else {
        obj.active_status = previousActiveStatus;
        this.cdRef.detectChanges();
      }
    }).catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  } else {
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
    this.getOrgDepartmentList();
  }
  searchDepartment(e: any) {
    if (e.target.value.length >= 3) {
      this.searchingvalue = e.target.value;
      setTimeout(() => {
        this.getOrgDepartmentList()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getOrgDepartmentList()
    }
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/department-management');
    this.getOrgDepartmentList();
  }
}

