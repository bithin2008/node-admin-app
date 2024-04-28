import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { IconService } from 'src/app/@core/services/icon.service';
import { of, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/@core/services/common.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import * as _ from "lodash";
import { MultiSelect } from 'primeng/multiselect';
import { SharedService } from 'src/app/@core/services/shared.service';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-page-seo-management',
  templateUrl: './page-seo-management.component.html',
  styleUrls: ['./page-seo-management.component.scss']
})
export class PageSeoManagementComponent {
  @ViewChild('multiSelect') multiSelect: MultiSelect | undefined;
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  pageSeoForm: any;
  public submitted!: boolean;
  public pageList: any = [];
  public propertyTypes: any = [];
  public searchRawData: any = [];
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  tenureList: any = [];
  pageSEOList: any = [];
  selectedTenure: any = '';
  sortField: string = 'page_seo_id'; // Default sorting field
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
  resetSearchInput = false;
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
    this.router.navigate(['/page-seo-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllPageSEO();
  }

  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private commonSvc: CommonService,
    private IconService: IconService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService
  ) {
    this.commonSvc.setTitle('Manage Plan Term');
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

  }
  ngOnInit(): void {
    this.getAllPageSEO();
  }

  get f() { return this.pageSeoForm.controls; }

  getAllPageSEO() {
    this.apiSvc.post(`${AppConfig.apiUrl.pageSeo.getAllPageSEO}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`,'').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.pageSEOList = val?.data;
        this.loading = false;
      }
    });
  }

  openViewSEOModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-m view-modal modal-lg', backdrop: 'static' });
    this.viewObj = obj
  }



  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getAllPageSEO();
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

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/page-seo-management');
    this.getAllPageSEO();
  }

  changeTenure(event: any) {
    console.log('event', event.target.value);
    this.getSelectedOptionText(event.target.value);
  }

  getSelectedOptionText(selectedValue: any) {
    let selectElement: any = document.querySelector('[formControlName="planTerm"]');
    for (var i = 0; i < selectElement.options.length; i++) {
      var option = selectElement.options[i];
      if (option.value == selectedValue) {
        // Get the text of the selected option
        this.selectedTenure = option.text;
        break; // Exit the loop since we found the selected option
      }
    }
  }



  selectUser(user: any) {
    console.log(user);
    this.selectedUser = _.filter(this.searchRawData, user.org_user_id)
    console.log(this.selectedUser[0]);
  }


  clearElasticSearch() {
    this.showItems = false;
    this.showNotFound = false;
    this.userSearchList = [];
  }

  async openaddEditPageSeoModal(template: TemplateRef<any>, obj: any) {
    this.pageList = await this.getAllPages();
    this.isEdit = false;
    this.modalRef = this.mdlSvc.show(template, { id: 1, backdrop: 'static',class:'modal-xl' });
    this.pageSeoForm = this.fb.group({
      pageId: ['', [Validators.required]],
      routeName: [''],
      title: ['', [Validators.required]],
      metaDescription: ['', [Validators.required]],
      h1Tag: ['', [Validators.required]],
      schemaMarkup: [''],
    })

    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      const selectedPage = this.pageList.find((page:any) => page.page_id == obj.page_id);
      if (selectedPage) {
        this.pageSeoForm.get('routeName').setValue(selectedPage.route_name);
      }
        this.pageSeoForm.patchValue({
          pageId: obj.page_id,
          title: obj.title,
          routeName: selectedPage?selectedPage.route_name:'',
          metaDescription: obj.meta_description,
          metaKeywords: obj.meta_keywords,
          h1Tag: obj.h1_tag,
          schemaMarkup: obj.schema_markup,
          activeStatus: obj.active_status.toString(),
        });

    }

      this.formValidationSvc.forms();
  }

  openEditSEOModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditPageSeoModal(template, obj);
    }, 200);
  }
  onChangePage(){
   
    const selectedPage = this.pageList.find((page:any) => page.page_id == this.f['pageId'].value);
    if (selectedPage) {
      this.pageSeoForm.get('routeName').setValue(selectedPage.route_name);
    }else{
      this.pageSeoForm.get('routeName').setValue('');
    }
    this.formValidationSvc.forms()
  }
  getAllPages() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.websitePages.getAllWebsitePages}?active_status=1`).subscribe({
        next: (res: any) => {
          resolve(res.data);
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });
    });
  }

  allowOnlyNumber(event: any) {
    let inputValue: any = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    this.pageSeoForm.patchValue({
      zipCode: inputValue
    });
  }


  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.pageSeoForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.pageSeo.updatePageSeo}/${this.editObj.page_seo_id}`, this.pageSeoForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
             
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getAllPageSEO();

              }, 500);
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
        this.apiSvc.post(AppConfig.apiUrl.pageSeo.createPageSeo, this.pageSeoForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getAllPageSEO();
              }, 500);
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
      this.formValidationSvc.validateAllFormFields(this.pageSeoForm);
    }

  }

  deletePageSEO(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete page SEO ${obj.title}  ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.pageSeo.deletePageSEO}/${obj.page_seo_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getAllPageSEO();
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
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} Page SEO ${obj.title} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.pageSeo.togglePageSEOStatus}/${obj.page_seo_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getAllPageSEO();
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
      .catch(() => { obj.active_status = previousActiveStatus;  });
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
    this.getAllPageSEO();
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
        this.getAllPageSEO()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllPageSEO()
    }
  }
}
