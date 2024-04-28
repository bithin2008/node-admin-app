import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, Subscription } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
@Component({
  selector: 'app-policy-renewals',
  templateUrl: './policy-renewals.component.html',
  styleUrls: ['./policy-renewals.component.scss']
})
export class PolicyRenewalsComponent {
  viewPolicyModalRef?: BsModalRef | null;
  policyList = [] as any;
  policyStatusList = [] as any;
  customerForm: any;
  viewPolicyObj: any
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  planTermList: any
  planList: any
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  permissionObj = {} as any
  filterByOrderDate = [] as any
  filterByExpWithBonusDate = [] as any
  
  // Pagination Config
  paginationObj = {
    first: 0,
    // The number of elements in the page
    limit: 10,
    // The total number of elements
    total: 10,
    // The total number of pages
    totalPages: 3,
    // The current page number
    currentPage: 1,
  };
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  sortField: string = 'policy_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  filterPolicyStatus: any = ''
  filterPlanName: any = ''
  filterPlanTerm: any = ''
  // advance search config
  advanceFilter:any
  advancedSearchConfig:any={
    inputConfig: [
      {isDisplay:true , propertyName:'full_name', value:null, placeholder:'Search',label:'Name',max:"50",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'email', value:null, placeholder:'Search',label:'Email',max:"50",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'mobile', value:null, placeholder:'Search', max:"13",label:'Mobile', className:'form-control',type:'textBox',inputType:'mobile'},
      {isDisplay:true , propertyName:'billing_zip', value:null, placeholder:'Search',label:'Zip',max:"5",className:'form-control', type:'textBox', inputType:'number',},
      {isDisplay:true , propertyName:'billing_state', value:null, placeholder:'Search',label:'State', max:"100",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'billing_city', value:null, placeholder:'Search',label:'City', max:"100",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'billing_address1', value:null, placeholder:'Search',label:'Address', max:"250",className:'form-control',type:'textBox',inputType:'text'},
      {isDisplay:true , propertyName:'policy_number', value:null, placeholder:'Search',label:'Policy No.',max:"50",className:'form-control', type:'textBox', inputType:'text'},
      {isDisplay:true , propertyName:'created_at', value:null, placeholder:'Search',label:'Created On', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker', maxDate: new Date()},
      // {isDisplay:true , propertyName:'filterByOrderDate', value:null, placeholder:'Search',label:'Order Date', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker'},
      // {isDisplay:true , propertyName:'filterByExpiryWithBonusdate', value:null, placeholder:'Search',label:'Search With Expiry With Bonus Date', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker'},
      // {isDisplay:true , propertyName:'plan_name', value:'', placeholder:'Select',label:'Plan Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      // {isDisplay:true , propertyName:'plan_term', value:'', placeholder:'Select',label:'Policy Term', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      {isDisplay:true , propertyName:'policy_status', value:'', placeholder:'Select',label:'Policy Status', className:'form-control',type:'dropdown',inputType:'dropdown',
        data:[
          {key:'Active',value:1},{key:"30 Days Wait",value:2},{key:"Expired",value:3},{key:"Awaiting Escrow Payment",value:4},{key:"Do not charge",value:5},{key:"Hold (Failed Payment)",value:6},]
        },
        {isDisplay:true , propertyName:'renewal_status', value:'', placeholder:'Select',label:'Policy Renewal Status', className:'form-control',type:'dropdown',inputType:'dropdown',
        data:[
          {key:'Renewed',value:1},{key:"Rejected By Customer",value:2},{key:"Renewal Pending",value:0}]
        },
      // {isDisplay:true , propertyName:'source', value:'', placeholder:'Select',label:'Source', className:'form-control',type:'dropdown',inputType:'dropdown',data:[{key:'Self Customer',value:0},{key:"Backed Team",value:1}]},
    ]
    
  }

  //Cancelled=>0, Active=>1, 30 Days Wait=>2,Expired=>3, Awaiting Escrow Payment=>4, do not charge =>5, Hold ( Failed Payment)=>6,
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
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
  ) {
    this.commonSvc.setTitle('Policy Renewal');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj: any) => {
    //   if (permissionObj) {
    //     this.permissionObj = permissionObj
    //     // Do something with the permission object
    //   } else {
    //     // Handle the case where no permission is found
    //   }
    // });
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }


  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/policy-management/policy-renewals'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getRenewPolicyList();
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(
            `${AppConfig.apiUrl.policy.getAllPolicies}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}${this.advanceFilter?this.advanceFilter:''}`, ''
          );
        })
      )
      .subscribe((response: any) => {
        this.paginationObj = response?.pagination;
        this.policyList = response?.data;
      });

    this.getRenewPolicyList();
    this.getAllPlans();
    this.getPlansTermList()
    this.getRenewalStatusList();
  }
  get f() { return this.customerForm.controls; }
  ngAfterViewInit() {
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }

  changeOrderDateFilter(ev: any) {
    if (ev) {
      if (ev.length > 0) {
        this.filterByOrderDate = [moment(ev[0]).format('YYYY-MM-DD'), moment(ev[1]).format('YYYY-MM-DD')];
        this.getRenewPolicyList();
      }
    } else {
      this.filterByOrderDate = []
      this.getRenewPolicyList();
    }
    this.formValidationSvc.forms();
  }
  changeExpWithBonusDateFilter(ev: any) {
    if (ev) {
      if (ev.length > 0) {
        this.filterByExpWithBonusDate = [moment(ev[0]).format('YYYY-MM-DD'), moment(ev[1]).format('YYYY-MM-DD')];
        this.getRenewPolicyList();
      }
    } else {
      this.filterByExpWithBonusDate = []
      this.getRenewPolicyList();
    }
  }
  getRenewPolicyList() {
    let api =`${AppConfig.apiUrl.policy.getAllRenewalPolicies}/renew-policy?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}${this.advanceFilter?this.advanceFilter:''}`
    this.apiSvc.post(api, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.policyList = response?.data;
        this.policyStatusList = response?.policy_status;
        this.advancedSearchConfig.inputConfig.forEach((element:any) => {
          if (element.propertyName=='plan_term') {
            element.data=this.policyStatusList;
          }
        });
        this.policyList.forEach((obj:any) => {
          obj.expiry_with_bonus = moment(obj.expiry_with_bonus).format('MM-DD-YYYY');
          obj.daysDifference = moment(obj.expiry_with_bonus).diff(moment(), 'days');          
        }); 
      }
    });
  }
  getPlansTermList() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlanTerms}?active_status=1`).subscribe({
      next: (val: any) => {
        const groupedData = val?.data.reduce((result: any, item: any) => {
          const month = item.plan_term_month;
          // Check if there's already an array for the current month
          if (!result[month]) {
            result[month] = [];
          }
          // Add the item to the array for the current month
          result[month].push(item);
          return result;
        }, {});
        // Convert the groupedData object back to an array
        const groupedArray = Object.keys(groupedData).map((month) => ({
          plan_term_month: parseInt(month, 10), // Convert back to a number
          plan_term: groupedData[month][0].plan_term
          // data: groupedData[month], // The array of items for this month
        }));
        this.planTermList = groupedArray;
        if (this.planTermList?.length>0){
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='plan_term') {
              this.planTermList.forEach((el:any) => {
                element.data.push({key:el.plan_term,value:el.plan_term_month})
              });
            }
          });
        }
      }

    });

  }

  getRenewalStatusList(){
    this.apiSvc.get(`${AppConfig.apiUrl.renewalStatusMaster.getAllRenewalStatus}?activeStatus=1`).subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          const renewalStatusList = res.data;
          const renewalStatusConfig = this.advancedSearchConfig.inputConfig.find((element: any) => element.propertyName === 'renewal_status');
          if (renewalStatusConfig) {
            renewalStatusConfig.data = [];
            renewalStatusList.forEach((el: any) => {
              renewalStatusConfig.data.push({ key: el.status_name, value: el.value });
            });
          }
        }
        
      },
      error: () => { },
      complete: () => { }
    });
  }

  getAllPlans() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlans}?active_status=1`).subscribe({
      next: (res: any) => {
        if (res.status==1) {
          let planList =res.data        
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='plan_name') {
              planList.forEach((el:any) => {
                element.data.push({key:el.plan_name,value:el.plan_name})
              });
            }
          });
        }
        
      },
      error: () => { },
      complete: () => { }
    });

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
    this.getRenewPolicyList();
  }


 /*  search(e: any) {
    // this.searchingvalue = '';
    const inputValue = e.target.value;
    // Define the minimum length required for calling the function
    const minLengthForCall = 3;
    // Check if the input value starts with a date pattern (e.g., "MM-DD-YYYY")
    const startsWithDatePattern = /^\d{2}-/.test(inputValue);
    // Determine the minimum length based on whether it starts with a date pattern
    const minLength = startsWithDatePattern ? 10 : minLengthForCall;

    if (inputValue.length >= minLength) {
      this.searchSubject.next(inputValue);
    } else {
      this.searchSubject.next('');
    }

    if (e.target.value.length == 0) {
      this.getRenewPolicyList();
    }
  } */
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/policy-management/policy-renewals');
    this.getRenewPolicyList();
  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
    this.advanceFilter=event.searchQuery
    console.log(this.advanceFilter);
    this.getRenewPolicyList();
  }
 

 async openViewPolicyModal(template: TemplateRef<any>, obj: any) {
    let response:any =await this.getPolicyDetails(obj.policy_id)
    if (response.status==1) {
      this.viewPolicyObj = response.data
      const currentDate = moment();
      const policyStartDate = moment(this.viewPolicyObj?.policy_start_date, 'YYYY-MM-DD');
      const policyExpiryDate = moment(this.viewPolicyObj?.expiry_with_bonus, 'YYYY-MM-DD');
      // Compare the policy start date with the current date
      if (policyStartDate.isAfter(currentDate)) {
        //console.log('Policy start date is in the future.');
        this.viewPolicyObj.policy_days_remaining = moment(policyExpiryDate).diff(policyStartDate, 'days');
      } else {
        // Compare the policy expiry date with the current date
        if (policyExpiryDate.isBefore(currentDate)) {
       
          //console.log('Policy expiry date is in the future or today.');
          this.viewPolicyObj.policy_days_remaining = 0;
        } else {
         // console.log('Policy expiry date has already passed.');
          this.viewPolicyObj.policy_days_remaining = moment(policyExpiryDate).diff(currentDate, 'days');
  
        }
      }
      this.viewPolicyModalRef = this.mdlSvc.show(template, { class: 'modal-fullscreen view-modal', backdrop: 'static' });

    }
  }
  getPolicyDetails(policyId:number) {
    return new Promise<void>((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.policy.getPolicyDetails}/${policyId}`, '').subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (err) => {
          reject(err)
        },
      })
    })
  }

  policyRenewalConfirmation(obj:any) {
    return new Promise((resolve, reject) => {
      this.confrmSvc.confirm('', `Are you absolutely sure? Want to change the status of policy number ${obj.policy_number} to 'Rejected By Customer`, 'Yes', 'No').then((res: any) => {
        if (res) {        
          if(obj?.renewal_status!=2){
            this.updatePolicyRenewalStatus(obj?.policy_id);
          }          
        } 
      })
    });
  }

  updatePolicyRenewalStatus(policyNumber:any){
    this.apiSvc.put(`${AppConfig.apiUrl.policy.updatePolicyRenewalStatus}/${policyNumber}`, { 'status': 2 }).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.getRenewPolicyList();
          this.alertService.success(response.message);
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

  resetAllFilter() {
    this.searchingvalue = '';
    this.searchSubject.next('');
    this.filterByExpWithBonusDate = [];
    this.filterByOrderDate = [];
    this.filterPlanName = '';
    this.filterPolicyStatus = '';
    this.filterPlanTerm = '';
    this.getRenewPolicyList();
  }
  navigateToEditPolicy(policy_id: any) {
    this.viewPolicyModalRef?.hide()
    const encodedId = encodeURIComponent(btoa(policy_id));
    this.router.navigate([`/policy-management/edit-policy/${encodedId}`]);
  }

  navigateToRenewPolicy(policy_id: any) {
    this.viewPolicyModalRef?.hide()
    const encodedId = encodeURIComponent(btoa(policy_id));
    this.router.navigate([`/policy-management/renew-policy/${encodedId}`]);
  }
  
  copyToClipBoard(val: string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }

  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }

  navigateToCreateClaim(policy_no:any) {
    this.router.navigate(['/claim-management/create-claim'], {
      queryParams: {
        policy_number: policy_no,
      },
    });
  }

  exportPolicyList(export_key:string){
    this.apiSvc.downloadFile(`${AppConfig.apiUrl.policy.getAllRenewalPolicies}/renew-policy/${export_key}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}${this.advanceFilter?this.advanceFilter:''}`, '').subscribe({
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
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
