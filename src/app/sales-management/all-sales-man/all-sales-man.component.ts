import { ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { IconService } from 'src/app/@core/services/icon.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/@core/services/common.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { checkAccessPermission } from 'src/app/@core/global';


@Component({
  selector: 'app-all-sales-man',
  templateUrl: './all-sales-man.component.html',
  styleUrls: ['./all-sales-man.component.scss']
})
export class AllSalesManComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  ProductIssueForm: any;
  public submitted!: boolean;
  public productList: any;
  loading: boolean = false;
  isEdit: boolean = false;
  permissionObj: any
  orgUsersList:any=[]
  productWiseProblems:any=[]
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
  searchingvalue: any = ''
  resetSearchInput = false;
  sortField: string = 'org_user_id'; // Default sorting field
  sortOrder: string = 'ASC'; // Default sorting order
  
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private commonSvc: CommonService,
    private IconService: IconService,
    private bsMdlSvc: BsModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef
    
  ) {
    
    this.commonSvc.setTitle('All Sales');
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
    // let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    // this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj: any) => {
    //   if (permissionObj) {
    //     this.permissionObj = permissionObj
    //     // Do something with the permission object
    //   } else {
    //     // Handle the case where no permission is found
    //   }
    // });

   
  }


  ngOnInit() {
    this.getOrgUserList(); 
  }

  getOrgUserList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsers}?page=${this.paginationObj.currentPage}&filterrole=${AppConfig.userRole.sales_representative}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`, '').subscribe({
    //this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsers}?page=${this.paginationObj.currentPage}&filterrole=[${AppConfig.userRole.sales_manager},${AppConfig.userRole.sales_representative}]&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`, '').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.orgUsersList = val?.data;
      }
    });
  }

  navigateToSalesmanDetails(salesman_id: any) {
    const encodedId = encodeURIComponent(btoa(salesman_id));
    this.router.navigate([`/sales-management/sales-man-details/${encodedId}`]);
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/sales-management/all-sales-man');
    this.getOrgUserList();
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
    this.getOrgUserList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/sales-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getOrgUserList();
  }
}
