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
import { SharedService } from '../@core/services/shared.service';
import { checkAccessPermission } from '../@core/global';

@Component({
  selector: 'app-plan-management',
  templateUrl: './plan-management.component.html',
  styleUrls: ['./plan-management.component.scss']
})
export class PlanManagementComponent {
  @ViewChild('multiSelect') multiSelect: MultiSelect | undefined;
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  planForm: any;
  public submitted!: boolean;
  public planList: any;
  public productList: any;
  selectedProducts: any = [];
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  sortField: string = 'sequence'; // Default sorting field
  sortOrder: string = 'ASC'; // Default sorting order
  searchingvalue: any = ''
  permissionObj: any
  resetSearchInput = false;
  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 0;
  page: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 1;
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
    this.router.navigate(['/plan-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getPlansList();
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
    this.getPlansList();
  }

  get f() { return this.planForm.controls; }

  getPlansList() {
    this.apiSvc.get(`${AppConfig.apiUrl.plans.getAllPlans}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`).subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.paginationObj = val?.pagination;
        this.planList = val?.data;
        this.loading = false;
      }
    });
  }

  getAllProducts() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1`).subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            resolve(res.data);
          } else {
            reject();
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });
    });

  }

  productChange() {
    //  console.log(_.map(this.f['productId'].value,'product_id'));
    this.selectedProducts = [];
    let selectedProd: any = _.map(this.f['productId'].value, 'product_id')
    this.selectedProducts.push(selectedProd.toString());
    console.log(this.selectedProducts);
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/plan-management');
    this.getPlansList();
  }
  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getPlansList();
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
    this.productList = [];
    let allProducts: any = await this.getAllProducts();
    allProducts.forEach((element: any) => {
      if (element.product_type == 1) {
        this.productList.push(element)
      }
    });
    this.isEdit = false;
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.planForm = this.fb.group({
      planName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      // maxPrice: ['', [Validators.required, this.formValidationSvc.numericOnly]],
      sequence: [''],
      productId: ['', [Validators.required]],
      activeStatus: ['1', [Validators.required]]
    })
    this.planForm.reset();
    this.planForm.clearValidators();
    this.submitted = false;
    setTimeout(() => {
      this.planForm.patchValue({
        activeStatus: '1'
      });
    }, 250);
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {
        let selectedProds: any = [];
        obj.product_id.split(',').forEach((element: any) => {
          this.productList.forEach((obj: any) => {
            if (element == obj.product_id) {
              selectedProds.push(obj)
            }
          });
        });
        this.planForm.patchValue({
          planName: obj.plan_name,
          maxPrice: 0,
          sequence: obj.sequence,
          productId: selectedProds,
          activeStatus: obj.active_status.toString()
        });
      }, 250);

    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }

  closeAddEditPlanModal() {
    this.planForm.reset()
    this.submitted = false;
    this.editObj = {};
    this.isEdit = false;
    this.modalRef?.hide();
  }

  openViewPlanModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-md view-modal', backdrop: 'static' });
    this.viewObj = obj
    console.log(this.viewObj);

  }

  openEditPlanModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditPlanModal(template, obj);
    }, 200);
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.planForm.valid) {
      if (this.selectedProducts.length == 0) {
        this.selectedProducts = [];
        let selectedProd: any = _.map(this.f['productId'].value, 'product_id')
        this.selectedProducts.push(selectedProd.toString());
      }
      let data = {
        planName: this.f['planName'].value,
        // maxPrice: this.f['maxPrice'].value,
        sequence: this.f['sequence'].value,
        productId: this.selectedProducts.toString(),
        activeStatus: this.f['activeStatus'].value,
      }
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.plans.updatePlan}/${this.editObj.plan_id}`, data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.selectedProducts = [];
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getPlansList();
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
        this.apiSvc.post(AppConfig.apiUrl.plans.createPlan, data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.selectedProducts = [];
              this.alertService.success(response.message);
              this.modalRef?.hide();
              //  setTimeout(() => {
              this.getPlansList();
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
      this.formValidationSvc.validateAllFormFields(this.planForm);
    }

  }

  deletePlan(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.plan_name} plan ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.plans.deletePlan}/${obj.plan_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getPlansList();
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
      this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.plan_name} Coverage Plan ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.put(`${AppConfig.apiUrl.plans.togglePlanStatus}/${obj.plan_id}`, { 'activeStatus': obj.active_status ? '0' : '1' }).subscribe({
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
              this.getPlansList();
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
    this.getPlansList();
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
        this.getPlansList()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getPlansList()
    }
  }
  resetAllFilter() {
    this.searchingvalue = '';
    this.getPlansList()
  }
}
