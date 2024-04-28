import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { AppConfig } from 'src/app/@utils/const/app.config';
import * as moment from 'moment';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-failed-payment',
  templateUrl: './failed-payment.component.html',
  styleUrls: ['./failed-payment.component.scss']
})
export class FailedPaymentComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  sortBy: any;
  sortDirection: boolean = false;
  resetSearchInput = false;
  subscription !: Subscription;
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  maxDate: any;
  minDate: any;
  dateRange: any = [];
  paymentList: any = [];
  startDate: any;
  endDate: any;
  fromAmount: any;
  toAmount: any;
  sortField: string = 'payment_date'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/policy-management/failed-payment'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllFailedPayment();
  }

  permissionObj = {
    view: false,
    add: false,
    edit: false,
    delete: false
  } as any;

  constructor(
    private apiSvc: ApiService,
    private alertService: AlertService,
    private commonSvc: CommonService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 10;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;

    });
    let currentRoute:any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    /* this.activatedRoute.data.subscribe((data: any) => {
      const subModuleDetails = data['subModuleDetails'];
      if (subModuleDetails) {
        this.sharedService.updateSubmoduleDetails(subModuleDetails);
        let combArr = subModuleDetails.permission_details.combination.split(',');
        this.permissionObj = {
          view: combArr[0] === '1',
          add: combArr[1] === '1',
          edit: combArr[2] === '1',
          delete: combArr[3] === '1'
        };
      }
    }); */
    this.commonSvc.setTitle('OrgUsers');
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }

  async ngOnInit(): Promise<void> {
    // this.getOrgUserList();
    this.paymentList = this.getAllFailedPayment();
  }
  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/policy-management/failed-payment');
    this.getAllFailedPayment();
  }
  changeDateFilter(ev: any) {
    if (ev) {
      if (ev.length > 0) {
        this.startDate = moment(ev[0]).format('YYYY-MM-DD');
        this.endDate = moment(ev[1]).format('YYYY-MM-DD');
        this.getAllFailedPayment();
      }
    } else {
      this.startDate = '';
      this.endDate = '';
      this.getAllFailedPayment();
    }
  }

  searchByAmount() {
    if (this.fromAmount == undefined) {
      this.alertService.error('Please enter from amount');
      return;
    }
    if (this.fromAmount <= 0) {
      this.alertService.error('From amount should not be 0 or less than 0');
      return;
    }
    if (this.toAmount == undefined) {
      this.alertService.error('Please enter to amount');
      return;
    }
    if (this.toAmount <= 0) {
      this.alertService.error('To amount should not be 0 or less than 0');
      return;
    }
    if (this.toAmount <= this.fromAmount) {
      this.alertService.error('from amount should not be greater than or equal to to amount');
      return;
    }
    this.getAllFailedPayment();
  }


  getAllFailedPayment() {
    let url = `${AppConfig.apiUrl.payments.getAllPayments}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&paymentStatus=2`;
      if (this.searchingvalue) {
        url = url + `&search=${this.searchingvalue}`;
      }   
      url = encodeURI(url);
    if (this.startDate && this.endDate) {
      url = url + `&startDate=${this.startDate}&endDate=${this.endDate}`;
    }
    if (this.fromAmount && this.toAmount) {
      url = url + `&fromAmount=${this.fromAmount}&toAmount=${this.toAmount}`;
    }  
    url = encodeURI(url);
    this.apiSvc.post(url,'').subscribe({
      next: (val: any) => {
        this.paymentList = val?.data;
        this.paginationObj = val?.pagination;
      }
    });
  }
  retryFailedPayment(obj:any){
    this.loading=true
    let url = `${AppConfig.apiUrl.payments.retryFailedPayment}/${obj.payment_id}`;
    this.apiSvc.post(url,'').subscribe({
      next: (res: any) => {
        if (res.status==1) {
          this.alertService.success(res.message)
        }else{
          this.alertService.error(res.message)
        }
        this.getAllFailedPayment();

      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getAllFailedPayment();
  }

  resetPagination() {
    this.paginationObj = {
      first: 0,
      currentPage: 1,
      limit: 5,
      total: 0,
      totalPages: 0
    };
  }

  openViewUserModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-md view-modal', backdrop: 'static' });
    this.viewObj = obj;
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
    this.getAllFailedPayment();
  }

  searchUser(e: any) {
    if (e.target.value.length >= 3) {
      this.searchingvalue = e.target.value;
      setTimeout(() => {
        this.getAllFailedPayment()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllFailedPayment()
    }
  }

  changeDate(e:any){
    if (e) {
      this.formValidationSvc.forms()
    }
  }
}
