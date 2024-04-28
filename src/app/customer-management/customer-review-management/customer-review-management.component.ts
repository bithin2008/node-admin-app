import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  selector: 'app-customer-review-management',
  templateUrl: './customer-review-management.component.html',
  styleUrls: ['./customer-review-management.component.scss']
})
export class CustomerReviewManagementComponent {
  viewAffiliatesModalRef?: BsModalRef | null;
  reviewList = [] as any;
  primaySearch: any = '';
  reviewForm: any;
  viewAffiliatesObj: any
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  planTermList: any
  planList: any
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  permissionObj = {} as any
  filterObj: any = {};
  resetSearchInput = false;
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
  sortField: string = 'customer_review_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  filterPolicyStatus: any = ''
  filterPlanName: any = ''
  filterPlanTerm: any = ''

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
    this.commonSvc.setTitle('Customer Review');
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
    this.router.navigate(['/customer-management/customer-review-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getReviewList();
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(
            `${AppConfig.apiUrl.affiliates.getAllAffiliates}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`, ''
          );
        })
      )
      .subscribe((response: any) => {
        this.paginationObj = response?.pagination;
        this.reviewList = response?.data;
      });

    this.getReviewList();
  }
  get f() { return this.reviewForm.controls; }

 

  getReviewList() {
    let url = `${AppConfig.apiUrl.customerReviews.getAllReviews}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`
    // if (this.filterObj.firstName) {
    //   url = url + `&firstName=${this.filterObj.firstName}`;
    // }
    // if (this.filterObj.lastName) {
    //   url = url + `&lastName=${this.filterObj.lastName}`;
    // }
    // if (this.filterObj.email) {
    //   url = url + `&email=${this.filterObj.email}`;
    // }
    // if (this.filterObj.mobile) {
    //   url = url + `&mobile=${this.filterObj.mobile}`;
    // }
    // if (this.filterObj.companyName) {
    //   url = url + `&companyName=${this.filterObj.companyName}`;
    // }
    this.apiSvc.post(url, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.reviewList = response?.data;
      }
    });
  }

  advancedFilter(fieldName: string) {
    if (this.filterObj[fieldName].length >= 3) {
      this.getReviewList();
    }
    if (this.filterObj[fieldName].length == 0) {
      this.getReviewList();
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
    this.getReviewList();
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
        this.getReviewList();
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getReviewList();
    }
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/customer-management/customer-review-management');
    this.getReviewList();
  }

  openViewAffiliateModal(template: TemplateRef<any>, obj: any) {
    this.viewAffiliatesModalRef = this.mdlSvc.show(template, {  backdrop: 'static',class:'modal-md' });
    this.viewAffiliatesObj = obj
  }

  async openAddEditReviewModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    this.modalRef = this.mdlSvc.show(template, {  backdrop: 'static',class:'modal-lg' });
    this.reviewForm = this.fb.group({
      firstName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      lastName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      description: ['', [Validators.required]],
      source: ['', [Validators.required]],
      rating: ['', [Validators.required]],
      activeStatus: ['1', [Validators.required]]
    })


    setTimeout(() => {
      this.reviewForm.patchValue({
        activeStatus: '1'
      });
    }, 250);
    this.submitted = false;
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {
        this.reviewForm.patchValue({
          firstName: obj.first_name,
          lastName: obj.last_name,
          description: obj.description,
          rating: obj.rating,
          source: parseInt(obj.review_source),
          activeStatus: obj.active_status.toString()
        });
      }, 250);
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }

  deleteReview(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete review ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.customerReviews.deleteReview}/${obj.customer_review_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getReviewList();
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

  closeAddEditReviewModal() {
    this.reviewForm.reset()
    this.submitted = false;
    this.editObj = {};
    this.isEdit = false;
    this.modalRef?.hide();
  }

  resetAllFilter() {
    this.searchingvalue = '';
    this.primaySearch = '';
    this.filterObj = {};
    this.searchSubject.next('');
    this.getReviewList();
  }

  onRatingChange(ev: any) {
    // Do something with the updated rating value
    console.log('New Rating:', ev);
    this.reviewForm.get('rating').setValue(ev.rating); // Update the form control value
  }

  onSubmit() {
    this.submitted = true;
    if (this.reviewForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.customerReviews.updateReview}/${this.editObj.customer_review_id}`, this.reviewForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getReviewList();
              }, 1000);

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
        this.apiSvc.post(AppConfig.apiUrl.customerReviews.createReview, this.reviewForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getReviewList();
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
    }else{
      this.formValidationSvc.validateAllFormFields(this.reviewForm);
    }
  }

  changePublishDate(ev: any) {
    if (ev) {
      this.reviewForm.patchValue({
        reviewDate: new Date(ev),
      })
      this.formValidationSvc.forms();
    }
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
