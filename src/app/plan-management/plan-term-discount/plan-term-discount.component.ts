import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { SharedService } from '../../@core/services/shared.service';
import { checkAccessPermission } from 'src/app/@core/global';
@Component({
  selector: 'app-plan-term-discount',
  templateUrl: './plan-term-discount.component.html',
  styleUrls: ['./plan-term-discount.component.scss']
})
export class PlanTermDiscountComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  planTermDiscountForm: any;
  public submitted!: boolean;
  public planTermDiscountList: any;
  public productList: any;
  selectedProducts: any = [];
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  sortField: string = 'planterm_discount_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  permissionObj: any
  resetSearchInput = false;
  selectedTerm:any='';
  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 0;
  page: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 1;
  tenureList:any = [];
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  };
  itemPerPageDropdown = [5,10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if(this.paginationObj.limit!==event.rows){
      this.paginationObj.limit=event.rows
    }
    this.router.navigate(['/plan-management/plan-term-discount'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getAllPlanTermDiscount();
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
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,

  ) {
    let currentRoute:any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
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
    //   // Now you can work with the resolved data
    // });
    this.commonSvc.setTitle('Plans');
    this.activatedRoute.queryParams.subscribe(params => {
      // this.page = parseInt(params['page']) || 1;
      // this.first = (this.page - 1) * 50 || 0;
      // this.itemPerPage = parseInt(params['limit']) || 50;
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });

  }
  ngOnInit(): void {
    this.getAllPlanTermDiscount();
    this.getPlansTermList();
  }

  getPlansTermList() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getPlanTerms}`).subscribe({
      next: (val: any) => { 
        //console.log(val?.data);
        
        this.tenureList = val?.data;      
        //this.getScfList();
      }
      
    });
  }

  get f() { return this.planTermDiscountForm.controls; }

  getAllPlanTermDiscount() {
    this.apiSvc.post(`${AppConfig.apiUrl.planTermDiscount.getAllPlanTermDiscounts}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}${this.selectedTerm?`&planTerm=${this.selectedTerm}`:''}`,'').subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.paginationObj = val?.pagination;
        this.planTermDiscountList = val?.data;
        this.loading = false;
      }
    });
  }

  changeTenure(item:any){
    this.selectedTerm=item   
    this.getAllPlanTermDiscount();
  }
  productChange() {
    //  console.log(_.map(this.f['productId'].value,'product_id'));
    this.selectedProducts = [];
    let selectedProd: any = _.map(this.f['productId'].value, 'product_id')
    this.selectedProducts.push(selectedProd.toString());
    //console.log(this.selectedProducts);
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getAllPlanTermDiscount();
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/plan-management/plan-term-discount');
    this.getAllPlanTermDiscount();
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

  async openaddEditPlanModal(template: TemplateRef<any>, obj: any) {

    this.isEdit = false;
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.planTermDiscountForm = this.fb.group({
      planTerm: ['', [Validators.required]],
      pricePercentage: ['', [Validators.required]],
      discountValue: ['', [Validators.required, this.formValidationSvc.numericTwoDecimal]],
      activeStatus: ['1', [Validators.required]]
    })
    this.planTermDiscountForm.reset();
    this.planTermDiscountForm.clearValidators();
    this.submitted = false;
    setTimeout(() => {
      this.planTermDiscountForm.patchValue({
        activeStatus: '1',
        pricePercentage:0
      });
    }, 250);
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => { 
        this.planTermDiscountForm.patchValue({
          planTerm: obj.plan_term,
          pricePercentage: obj.price_percentage,
          discountValue: obj.discount_value?obj.discount_value:null,
          activeStatus: obj.active_status.toString()
        });
      }, 250);

    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }

  closeAddEditPlanModal() {
    this.planTermDiscountForm.reset()
    this.submitted = false;
    this.modalRef?.hide();
    this.editObj = {};
  //  this.isEdit = false;
   
  }

  openViewPlanModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-md view-modal', backdrop: 'static' });
    this.viewObj = obj
    console.log(this.viewObj);

  }

  openEditPlanTermDiscountModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditPlanModal(template, obj);
    }, 200);
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.planTermDiscountForm.valid) { 
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.planTermDiscount.updatePlanTermDiscount}/${this.editObj.planterm_discount_id}`, this.planTermDiscountForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.selectedProducts = [];
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getAllPlanTermDiscount();
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
        this.apiSvc.post(AppConfig.apiUrl.planTermDiscount.createPlanTermDiscount, this.planTermDiscountForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              //  setTimeout(() => {
              this.getAllPlanTermDiscount();
              //  }, 500);
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
      this.formValidationSvc.validateAllFormFields(this.planTermDiscountForm);
    }

  }

  deletePlanTermDiscount(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete Plan term discount ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.planTermDiscount.deletePlanTermDiscount}/${obj.planterm_discount_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getAllPlanTermDiscount();
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
    if (this.permissionObj?.edit) {
      ev.preventDefault();
      const previousActiveStatus = obj.active_status;
      this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} Plan Term Discount ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.put(`${AppConfig.apiUrl.planTermDiscount.togglePlanTermDiscountStatus}/${obj.planterm_discount_id}`, { 'activeStatus': obj.active_status ? '0' : '1' }).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.alertService.success(response.message);
              } else {
                this.alertService.error(response.message);
              }
            },
            error: () => {
            },
            complete: () => {
              this.getAllPlanTermDiscount();
            }
          });
        }
      }).catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });

    } else {
      this.alertService.error(`You are not authorised to do this. `);
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
    this.getAllPlanTermDiscount();
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
        this.getAllPlanTermDiscount()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getAllPlanTermDiscount()
    }
  }
  resetAllFilter(){
    this.searchingvalue='';
    this.selectedTerm='';
    this.getAllPlanTermDiscount()
  }
}
