import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from "lodash";
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { base64ToFile } from 'ngx-image-cropper';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../@core/services/shared.service';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-manage-sales-commission',
  templateUrl: './manage-sales-commission.component.html',
  styleUrls: ['./manage-sales-commission.component.scss']
})
export class ManageSalesCommissionComponent {
  modalRef?: BsModalRef | null;
  duplicateCheckArr: any = [];
  viewModalRef?: BsModalRef | null;
  orgModuleSubmodulePermissionRef?: BsModalRef | null;
  salesCommissionForm: any;
  viewObj: any = {};
  sortBy: any;
  resetSearchInput = false;
  sortField: string = 'policy_wise_commission_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  paymentStatusList: any = [];
  public commissionTypeList: any;
  public salesmanList: any;
  public selectedSalesman: any = '';
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  commissionTotal: any = 0;
  isEdit: boolean = false;
  editObj: any = {};
  editObjClone: any = {};
  permissionObj: any;
  // Pagination Config
  paginationObj = {
    first: 0,
    // The number of elements in the page
    limit: 50,
    // The total number of elements
    total: 10,
    // The total number of pages
    totalPages: 3,
    // The current page number
    currentPage: 1,
  };
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  searchingvalue: any = ''
  userRole: any = {}  
  payment_status: any='';
  subject: any;
  loggedInUserObj:any
  commissionData: any[] = [];

 
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    public formBuilder: UntypedFormBuilder,
    private validator: FormValidationService,
    private activatedRoute: ActivatedRoute,
    private commonSvc: CommonService,
    private alertSvc: AlertService,
    private router: Router,
    private bsMdlSvc: BsModalService,
    private sharedService: SharedService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.commonSvc.setTitle('Organizations');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    this.sharedService.sharedUserData$.subscribe((response: any) => {
       if (response.data) {
         this.loggedInUserObj=response.data   
         if (this.loggedInUserObj.user_role_id!=AppConfig.userRole.admin && this.loggedInUserObj.user_role_id!=AppConfig.userRole.sales_manager) {
          console.log(1);
          this.selectedSalesman=this.loggedInUserObj.org_user_id
          this.getSalesCommissionList();
         }
          
       } 
     })
    
     this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }
  ngOnInit(): void {
    this.getAllSalesmanList();
    //this.getAllPolicyAndPaymentStatus();
    this.userRole=AppConfig.userRole
  }

  paginate(event: any) {    
    this.paginationObj.first = event.first;
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/commission-management/manage-sales-commission'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });

    this.updatePaginatedItems();
  }

  updatePaginatedItems() {
    const startIndex = this.paginationObj.first;
    const endIndex = startIndex + this.paginationObj.limit;
    this.commissionData = this.commissionTypeList.slice(startIndex, endIndex);
    
  }
  getAllPolicyAndPaymentStatus() {
    let api =`${AppConfig.apiUrl.policy.getAllStatusAndPaymentType}`
    this.apiSvc.post(api, '').subscribe({
      next: (response: any) => {
        if (response.status==1) {
          this.paymentStatusList=response?.data?.all_payment_status_type?.payment_status
        }
      }
    });
  }
  
  openViewOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.bsMdlSvc.show(template, { class: 'modal-lg view-modal', backdrop: 'static' });
    this.viewObj = obj
  }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
    }
  }

  get f() { return this.salesCommissionForm.controls; }

  async openaddEditPlanModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    this.modalRef = this.bsMdlSvc.show(template, { id: 1, backdrop: 'static', class: 'modal-lg' });
    this.salesCommissionForm = this.fb.group({
      commissionValue: ['', [Validators.required]],
      commissionNotes: ['', [Validators.required]],
      activeStatus: ['1', [Validators.required]],
    })
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {

        setTimeout(() => {
          this.salesCommissionForm.patchValue({
            activeStatus: '1'
          });
        }, 250);

        this.salesCommissionForm.patchValue({
          commissionValue: obj.commission_value,
          commissionNotes: obj.notes,
          activeStatus: obj.active_status.toString(),
        });
      }, 450);

    }

    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 350);
  }

  updateSorting(columnName: string) {
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    this.getSalesCommissionList();
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj, '/commission-management/manage-sales-commission');
    this.getSalesCommissionList();
  }

  getSalesCommissionList() {
    let data = { org_user_id: this.selectedSalesman }
    this.apiSvc.post(`${AppConfig.apiUrl.salesCommissions.getAllSalesCommissions}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}${this.payment_status?`&payment_status=${this.payment_status}`:''}`, data).subscribe({
      next: (val: any) => {
        this.commissionTypeList = val?.data;
        this.commissionTotal=val.total_commission
        this.loading = false;
        this.updatePaginatedItems()
      }
    });
  }

  getAllSalesmanList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgSimpleUsersList}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.salesmanList = response.data;
          if (this.loggedInUserObj.user_role_id==AppConfig.userRole.admin || this.loggedInUserObj.user_role_id==AppConfig.userRole.sales_manager) {
            console.log(2);
            
            this.selectedSalesman=response.data[0].org_user_id
            this.getSalesCommissionList();
           }
        }
      },
      error: () => {
      },
      complete: () => {
      }
    });
  }

  changeSalesman() {
    this.getSalesCommissionList();
  }

  statusChange() {
    this.getSalesCommissionList();
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getSalesCommissionList();
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

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} this commission?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.commissions.toggleActiveCommissionStatus}/${obj.policy_wise_commission_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              setTimeout(() => {
                this.getSalesCommissionList();
              }, 250);
            } else {
              this.alertSvc.error(response.message);
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
    })
      .catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.salesCommissionForm.valid) {

      this.apiSvc.put(`${AppConfig.apiUrl.salesCommissions.updateSalesCommission}/${this.editObj.policy_wise_commission_id}`, this.salesCommissionForm.value).subscribe({
        next: (response: any) => {
          if (response.status == 1) {

            this.alertSvc.success(response.message);
            this.modalRef?.hide();
            setTimeout(() => {
              this.getSalesCommissionList();
            }, 500);
            this.loading = false;
          } else {
            this.alertSvc.error(response.message);
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
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.salesCommissionForm);
    }

  }

  openEditOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditPlanModal(template, obj);
    }, 200);
  }

  search(e: any) {
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
        this.getSalesCommissionList();
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getSalesCommissionList();
    }
  }
  navigateToCustomerDetails(obj:any){
    if(obj?.customer_id){
      let customer_id= obj?.customer_id
      const encodedId = encodeURIComponent(btoa(customer_id));
      this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
    }
  
  }
}
