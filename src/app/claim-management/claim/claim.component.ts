import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent {
  viewClaimModalRef?: BsModalRef | null;
  claimList = [] as any;
  priorityList = [] as any;
  planList:any
  customerForm: any;
  viewClaimObj:any
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  permissionObj={}as any;
  claimTicketStatusList:any
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
  itemPerPageDropdown = [5,10, 20, 30, 50, 100, 150, 200];
  sortField: string = 'claim_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  filterClaimStatus:any=''
  filterPlanName:any=''
  filterPlanTerm:any=''
  advanceFilter:any
  advancedSearchConfig:any={
    inputConfig: [
      {isDisplay:true , propertyName:'full_name', value:null, placeholder:'Search',label:'Name',max:"50",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'$policy_details.email$', value:null, placeholder:'Search',label:'Email',max:"50",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'$policy_details.mobile$', value:null, placeholder:'Search', max:"13",label:'Mobile', className:'form-control',type:'textBox',inputType:'mobile'},
      {isDisplay:true , propertyName:'$policy_details.billing_zip$', value:null, placeholder:'Search',label:'Zip',max:"5",className:'form-control', type:'textBox', inputType:'number',},
      {isDisplay:true , propertyName:'$policy_details.billing_state$', value:null, placeholder:'Search',label:'State', max:"100",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'$policy_details.billing_city$', value:null, placeholder:'Search',label:'City', max:"100",className:'form-control', type:'textBox', inputType:'text',},
      {isDisplay:true , propertyName:'$policy_details.billing_address1$', value:null, placeholder:'Search',label:'Address', max:"250",className:'form-control',type:'textBox',inputType:'text'},
      {isDisplay:true , propertyName:'$policy_details.policy_number$', value:null, placeholder:'Search',label:'Policy No.',max:"50",className:'form-control', type:'textBox', inputType:'text'},
      {isDisplay:true , propertyName:'ticket_no', value:null, placeholder:'Search',label:'Claim No.',max:"50",className:'form-control', type:'textBox', inputType:'text'},
      {isDisplay:true , propertyName:'$product_details.product_name$', value:null, placeholder:'Search',label:'Product Name',max:"50",className:'form-control', type:'textBox', inputType:'text'},
      {isDisplay:true , propertyName:'created_at', value:null, placeholder:'Search',label:'Created On', className:'form-control',type:'dateRangePicker',inputType:'dateRangePicker', maxDate: new Date()},
      {isDisplay:true , propertyName:'$policy_details.plan_details.plan_name$', value:null, placeholder:'Select',label:'Plan Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      {isDisplay:true , propertyName:'$claim_ticket_status_details.ticket_status$', value:null, placeholder:'Select',label:'Claim Ticket Status', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      {isDisplay:true , propertyName:'priority', value:'', placeholder:'Select',label:'Priority', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
    ]
    
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
    private sharedService:SharedService,
  ) {
    this.commonSvc.setTitle('Claim Management');      
    //  let currentRoute:any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    //  this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj:any) => {
    //   if (permissionObj) {
    //     this.permissionObj=permissionObj
    //     // Do something with the permission object
    //   } else {
    //     // Handle the case where no permission is found
    //   }
    // });
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }
    

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if(this.paginationObj.limit!==event.rows){
      this.paginationObj.limit=event.rows
    }
    this.router.navigate(['/claim-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getclaimList();
  }
  
  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(
            `${AppConfig.apiUrl.claims.getAllClaims}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}`, ''
          );
        })
      )
      .subscribe((response: any) => {
        this.paginationObj = response?.pagination;
        this.claimList = response?.data;
      });
    this.getClaimPriority()
    this.getclaimList();
    this.getAllPlans();
    this.getClaimTicketStatus()
  }
  get f() { return this.customerForm.controls; }
  ngAfterViewInit() {
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }
  


  getclaimList() {
    this.apiSvc.post(`${AppConfig.apiUrl.claims.getAllClaims}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}${this.advanceFilter?this.advanceFilter:''}`, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.claimList = response?.data;
        
      }
    });
  }

   getAllPlans() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlans}?active_status=1`).subscribe({
      next: (res: any) => {
        if (res.status==1) {
          let planList =res.data        
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='$policy_details.plan_details.plan_name$') {
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

  getClaimTicketStatus(){
    this.apiSvc.get(`${AppConfig.apiUrl.claims.getAllClaimTicketStatuses}?active_status=1`).subscribe({
      next:(response:any)=>{
        if (response.status==1) {
          this.claimTicketStatusList=response?.data
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='$claim_ticket_status_details.ticket_status$') {
              this.claimTicketStatusList.forEach((el:any) => {
                element.data.push({key:el.ticket_status,value:el.ticket_status})
              });
            }
          });
        }
      }
    })
  }

 getClaimPriority() {//priority
    this.apiSvc.get(`${AppConfig.apiUrl.priority.getAllPriority}?active_status=1`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.priorityList = response?.data
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='priority') {
              this.priorityList.forEach((el:any) => {
                element.data.push({key:el.priority_name,value:el.priority_name})
              });
            }
          });
        }
      }
    })
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
    this.getclaimList();
  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
    this.advanceFilter=event.searchQuery
    console.log(this.advanceFilter);
    this.getclaimList();
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
      this.searchSubject.next(inputValue);
    } else {
      this.searchSubject.next('');
    }
  
    if (e.target.value.length == 0) {
      this.getclaimList();
    }
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/claim-management');
    this.getclaimList();
  }
  openViewClaimModal(template: TemplateRef<any>, obj: any) {
    this.viewClaimModalRef = this.mdlSvc.show(template, { class: 'modal-fullscreen view-modal', backdrop: 'static' });
    this.viewClaimObj = obj
  }

  resetAllFilter(){
    this.searchingvalue = '';
    this.searchSubject.next('');
    this.filterPlanName='';
    this.filterClaimStatus='';
    this.filterPlanTerm='';
    this.getclaimList();
  }
  navigateToEditClaim(Claim_id:any){
    this.viewClaimModalRef?.hide()
    const encodedId = encodeURIComponent(btoa(Claim_id));
    this.router.navigate([`/claim-management/edit-claim/${encodedId}`]);
  }
  copyToClipBoard(val:string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }
  exportClaimList(export_key:string){
    this.apiSvc.downloadFile(`${AppConfig.apiUrl.claims.getAllClaims}/${export_key}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}${this.advanceFilter?this.advanceFilter:''}`, '').subscribe({
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
  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
