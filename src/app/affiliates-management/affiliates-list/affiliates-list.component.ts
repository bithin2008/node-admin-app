import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, debounceTime, distinctUntilChanged, switchMap , of, Subscription } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';


@Component({
  selector: 'app-affiliates-list',
  templateUrl: './affiliates-list.component.html',
  styleUrls: ['./affiliates-list.component.scss']
})
export class AffiliatesListComponent {
  viewAffiliatesModalRef?: BsModalRef | null;
  affiliatesList = [] as any;
  primaySearch:any=''
  customerForm: any;
  viewAffiliatesObj:any
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  planTermList:any
  planList:any
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  permissionObj={}as any
  filterObj: any = {};

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
  sortField: string = 'affiliate_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false;
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  filterPolicyStatus:any=''
  filterPlanName:any=''
  filterPlanTerm:any=''
  
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
    this.commonSvc.setTitle('Policy Management');  
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }    
    //  let currentRoute:any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    //  this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj:any) => {
    //   if (permissionObj) {
    //     this.permissionObj=permissionObj
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
    if(this.paginationObj.limit!==event.rows){
      this.paginationObj.limit=event.rows
    }
    this.router.navigate(['/affiliates-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAffiliatesList();
  }
  
  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(
            `${AppConfig.apiUrl.affiliates.getAllAffiliates}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}`, ''
          );
        })
      )
      .subscribe((response: any) => {
        this.paginationObj = response?.pagination;
        this.affiliatesList = response?.data;
      });

    this.getAffiliatesList();
  }
  get f() { return this.customerForm.controls; }
  ngAfterViewInit() {
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }
  


  getAffiliatesList() {
    let url = `${AppConfig.apiUrl.affiliates.getAllAffiliates}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}`
    if(this.filterObj.firstName){
      url= url+ `&firstName=${this.filterObj.firstName}`;
    }
    if(this.filterObj.lastName){
      url= url+ `&lastName=${this.filterObj.lastName}`;
    }
    if(this.filterObj.email){
      url= url+ `&email=${this.filterObj.email}`;
    }
    if(this.filterObj.mobile){
      url= url+ `&mobile=${this.filterObj.mobile}`;
    }
    if(this.filterObj.companyName){
      url= url+ `&companyName=${this.filterObj.companyName}`;
    }
    this.apiSvc.post(url, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.affiliatesList = response?.data;
      }
    });
  }

  advancedFilter(fieldName:string){
    if(this.filterObj[fieldName].length>= 3){
      this.getAffiliatesList();
    }
    if(this.filterObj[fieldName].length== 0){
      this.getAffiliatesList();
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
    this.getAffiliatesList();
  }


  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/affiliates-management');
    this.getAffiliatesList();
  }
  // search(e: any) {
  //   this.searchingvalue = '';
  //   const inputValue = e.target.value;

  //   if (inputValue.length >= 3) {
  //     this.searchSubject.next(inputValue);
  //   } else {
  //     this.searchSubject.next('');
  //   }
  
  //   if (e.target.value.length == 0) {
  //     this.getAffiliatesList();
  //   }
  // }

  openViewAffiliateModal(template: TemplateRef<any>, obj: any) {
    this.viewAffiliatesModalRef = this.mdlSvc.show(template, {  backdrop: 'static',class:'modal-md' });
    this.viewAffiliatesObj = obj
  }

  resetAllFilter(){
    this.searchingvalue = '';
    this.primaySearch='';
    this.filterObj={};
    this.searchSubject.next('');
    this.getAffiliatesList();
  }
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
