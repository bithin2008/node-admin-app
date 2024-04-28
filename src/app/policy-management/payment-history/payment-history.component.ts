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
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  sortBy: any;
  sortDirection: boolean = false;

  subscription !: Subscription;
  loading: boolean = true;
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
  paymentType:any='';
  paymentStatus:any='';
  sortField: string = 'created_at'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;

  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 50,
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
    this.router.navigate(['/policy-management/payment-history'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllPaymentHistory();
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
      this.paginationObj.limit = parseInt(params['limit']) || 50;
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
  //   this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj:any) => {
  //    if (permissionObj) {
  //      this.permissionObj=permissionObj
  //      // Do something with the permission object
  //    } else {
  //      // Handle the case where no permission is found
  //    }
  //  });
   /*  this.activatedRoute.data.subscribe((data: any) => {
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
    this.commonSvc.setTitle('Payment History');
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }
  advanceFilter:any
  advancedSearchConfig:any={
    inputConfig: [
      {isDisplay:true , propertyName:'full_name', value:null, placeholder:'Search',label:' Name',max:"50",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'email', value:null, placeholder:'Search',label:'Email',max:"50",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'fromAmount', value:null, placeholder:'Search',label:'From Amount.',max:"50",className:'form-control', type:'textBox', inputType:'number'},
      {isDisplay:true , propertyName:'toAmount', value:null, placeholder:'Search',label:'To Amount.',max:"50",className:'form-control', type:'textBox', inputType:'number'},
      {isDisplay:true , propertyName:'policy_number', value:null, placeholder:'Search',label:'Policy No.',max:"50",className:'form-control', type:'textBox', inputType:'text'},
      {isDisplay:true , propertyName:'filterByCreatedAtDate', value:null, placeholder:'Search',label:'Created On', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker'},
      {isDisplay:true , propertyName:'filterByPaymentDate', value:null, placeholder:'Search',label:'Expected Payment Date', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker'},
      {isDisplay:true , propertyName:'filterByPaymentSuccessDate', value:null, placeholder:'Search',label:'Successfully Payment Date', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker'},
      {isDisplay:true , propertyName:'paymentStatus', value:null, placeholder:'Select',label:'Payment Status', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      {isDisplay:true , propertyName:'paymentType', value:null, placeholder:'Select',label:'Payment Type', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},//Link
    ]
    
  }
   ngOnInit() {
    this.getAllPolicyAndPaymentStatus();
   // this.paymentList = this.getAllPaymentHistory();
  }

  changeDateFilter(ev: any) {
    if (ev) {
      if (ev.length > 0) {
        this.formValidationSvc.forms();
        this.startDate = moment(ev[0]).format('YYYY-MM-DD');
        this.endDate = moment(ev[1]).format('YYYY-MM-DD');
        this.getAllPaymentHistory();
      }
    } else {
      this.startDate = '';
      this.endDate = '';
      this.getAllPaymentHistory();
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
    this.getAllPaymentHistory();
  }

  filterByPaymentType(){
    this.getAllPaymentHistory();
  } 


  ngAfterViewInit() {
    this.formValidationSvc.forms();
  }

  getAllPaymentHistory() {
    let url = `${AppConfig.apiUrl.payments.getAllPayments}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.advanceFilter?this.advanceFilter:''}`;
    if (this.searchingvalue) {
      url = url + `&search=${this.searchingvalue}`;
    }   
    if (this.startDate && this.endDate) {
      url = url + `&startDate=${this.startDate}&endDate=${this.endDate}`;
    }
    if (this.fromAmount && this.toAmount) {
      url = url + `&fromAmount=${this.fromAmount}&toAmount=${this.toAmount}`;
    }
     if (this.paymentType) {
      url = url + `&paymentType=${this.paymentType}`;
    }
    if(this.paymentStatus){
      url = url + `&paymentStatus=${this.paymentStatus}`;
    }
    url = encodeURI(url);
    this.apiSvc.post(url,'').subscribe({
      next: (val: any) => {
        this.paymentList = val?.data;
        this.paginationObj = val?.pagination;
        // this.advancedSearchConfig.inputConfig.forEach((element:any) => {

        //   if (element.propertyName=='paymentStatus') {
        //    // element.data
        //    element.data=[]
        //    val?.payment_status.forEach((el:any) => {
        //       element.data.push({key:el.label,value:el.id})
        //     });
        //   }
        //   if (element.propertyName=='paymentType') {
        //    // element.data
        //    element.data=[]
        //    val?.payment_type.forEach((el:any) => {
        //       element.data.push({key:el.label,value:el.id})
        //     });
        //   }
        // });
      }
    });
  }

  getAllPolicyAndPaymentStatus() {
    let api =`${AppConfig.apiUrl.policy.getAllStatusAndPaymentType}`
    this.apiSvc.post(api, '').subscribe({
      next: (response: any) => {
        if (response.status==1) {
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='paymentStatus') {
             element.data=[]
             response?.data?.all_payment_status_type?.payment_status.forEach((el:any) => {
                element.data.push({key:el.status_name,value:el.value})
              });
            }
            if (element.propertyName=='paymentType') {
              element.data=[]
              response?.data?.all_payment_status_type?.payment_type.forEach((el:any) => {
                 element.data.push({key:el.label,value:el.id})
               });
             }  
          });
        }
      }
    });
  }
  exportPaymentList(export_key:string){
    let url = `${AppConfig.apiUrl.payments.getAllPayments}/${export_key}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}${this.advanceFilter?this.advanceFilter:''}`;
    this.apiSvc.downloadFile(url, '').subscribe({
      next: (response: any) => {

        let fileName = response.headers.get('content-disposition')?.split(';')[1].split('=')[1];
        // Create a blob from the response
        let blob = new Blob([response.body], { type: response.type });
  
        // Create a URL for the blob
        let blobUrl = window.URL.createObjectURL(blob);
  
        // Create a download link
        let a = document.createElement('a');
        a.download = fileName;
        a.href = blobUrl;
        a.click();
        this.alertService.success(response.message)
      }
    });

  }
  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getAllPaymentHistory();
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
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-lg view-modal', backdrop: 'static' });
    this.viewObj = obj;
  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
  
    this.advanceFilter=event.searchQuery
    this.getAllPaymentHistory();
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
    this.getAllPaymentHistory();
  }

  search(e: any) {
    if (e.target.value.length >= 3) {
      this.searchingvalue = e.target.value;
      setTimeout(() => {
        this.getAllPaymentHistory()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllPaymentHistory()
    }
  }

 
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/policy-management/payment-history');
    this.getAllPaymentHistory();
  }
  copyToClipBoard(val: string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }

  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
}
