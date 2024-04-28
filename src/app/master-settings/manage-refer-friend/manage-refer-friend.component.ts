import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/@core/services/common.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import * as _ from "lodash";
import { SharedService } from 'src/app/@core/services/shared.service';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-manage-refer-friend',
  templateUrl: './manage-refer-friend.component.html',
  styleUrls: ['./manage-refer-friend.component.scss']
})
export class ManageReferFriendComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  public submitted!: boolean;
  public planList: any = [];
  public propertyTypes: any = [];
  public searchRawData: any = [];
  public primaySearch:any='';
  resetSearchInput=false;
  selectedProducts: any = [];
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  tenureList: any = [];
  referFriendList: any = [];
  selectedTenure: any = '';
  sortField: string = 'refer_friend_id'; // Default sorting field
  sortOrder: string = 'desc'; // Default sorting order
  searchingvalue: any = ''
  searchingUservalue: any = ''
  permissionObj: any;
  public autocompleteLoader: boolean = false;
  public autoSearchText: any = '';
  public showNotFound: boolean = false;
  public showItems: boolean = false;
  public userSearchList: any = [];
  public selectedUser: any = {};

  userSearchField: any = '';

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
    this.router.navigate(['/master-settings/manage-refer-friend'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllReferFriend();
  }

  constructor(
    private apiSvc: ApiService,
    private alertService: AlertService,
    private modalService: BsModalService,
    private commonSvc: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService
  ) {
    this.commonSvc.setTitle('Manage Refer Friend');
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;

    });
    // this.activatedRoute.data.subscribe((data: any) => {
    //   const subModuleDetails = data['subModuleDetails'];
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
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }

  }
  ngOnInit(): void {
    this.getAllReferFriend();
  }

  resetAllFilter() {
    this.searchingvalue = '';
    this.primaySearch = '';
    // this.filterObj = {};
    // this.searchSubject.next('');
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);
    this.getAllReferFriend();
  }



  getAllReferFriend() {
    let url = `${AppConfig.apiUrl.referfriend.getAllReferFriend}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`
    this.apiSvc.post(url, '').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.referFriendList = val?.data;
        this.loading = false;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getAllReferFriend();
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

  clearElasticSearch() {
    this.showItems = false;
    this.showNotFound = false;
    this.userSearchList = [];
  }

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.ip_address} post ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.whitelistips.toggleIPAddressStatus}/${obj.whitelist_ip_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getAllReferFriend();
              }, 250);
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
        //  obj.active_status=previousActiveStatus
        obj.active_status = previousActiveStatus;
        // this.cdRef.detectChanges();
      }
    })
      .catch(() => { obj.active_status = previousActiveStatus; });
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
    this.getAllReferFriend();
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
        this.getAllReferFriend()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllReferFriend()
    }
  }

  openViewReferFriendModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-md view-modal', backdrop: 'static' });
    this.viewObj = obj

  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/master-settings/manage-refer-friend');
    this.getAllReferFriend();
  }
  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
}
