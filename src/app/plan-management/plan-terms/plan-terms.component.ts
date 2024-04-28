import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  selector: 'app-plan-terms',
  templateUrl: './plan-terms.component.html',
  styleUrls: ['./plan-terms.component.scss']
})
export class PlanTermsComponent {
  @ViewChild('multiSelect') multiSelect: MultiSelect | undefined;
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  planTermsForm: any;
  public submitted!: boolean;
  public planList: any = [];
  public propertyTypes: any = [];
  selectedProducts: any = [];
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  tenureList: any = [];
  planTermList: any = [];
  selectedTenure: any = '';
  sortField: string = 'plan_terms_id'; // Default sorting field
  sortOrder: string = 'desc'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput=false
  permissionObj: any
  // Pagination Config
  paginationObj: any = {};
  currentPageIndex: number = 0;
  first: number = 0;
  page: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 50;
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/plan-management/plan-term'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getPlansTermList();
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
    // });

  }
  
  changeSatus(event:any){
   if (!event) {
    this.planTermsForm.patchValue({
      show_website:false
    })
   }

  }
  async ngOnInit() {
    this.getPlansTermList();
   
    this.planList = await this.getAllPlans();
    this.propertyTypes = await this.getAllPropertyTypes();
   this.getPlansTerms()
  }

  get f() { return this.planTermsForm.controls; }

  getPlansTermList() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlanTerms}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`).subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.paginationObj = val?.pagination;
        this.planTermList = val?.data;
        this.loading = false;
      }
    });
  }

  getPlansTerms() {
    this.apiSvc.get(`${AppConfig.apiUrl.termsMaster.getAllTerms}?activeStatus=1`).subscribe({
      next: (val: any) => { 
        //console.log(val?.data);
        
        this.tenureList = val?.data;      
        //this.getScfList();
      }
      
    });
  }
  getAllPlans() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlans}?active_status=1`).subscribe({
        next: (res: any) => {
          resolve(res.data);
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });
    });
  }

  getAllPropertyTypes() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPropertyTypes}`).subscribe({
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





  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getPlansTermList();
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
  minValidatorWithOtheField(controlName: string) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (this.planTermsForm) {
        console.log(' this.planTermsForm', this.planTermsForm.get(controlName).value);

        const minPriceControl = this.planTermsForm.get(controlName).value;
        const currentControl = control.value;

        if (minPriceControl && currentControl) {
          const minPrice = minPriceControl;

          if (currentControl > minPrice) {
            return { 'minValueCheck':  true };
          }
        }
      }
      return null;
    };
  }

  async openaddEditPlanModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
  
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.planTermsForm = this.fb.group({
      planId: ['', [Validators.required]],
      planTerm: ['', [Validators.required]],
      propertyType: ['', [Validators.required]],
      priceBelow5000Sqft: ['', [this.formValidationSvc.numericTwoDecimal]],
      priceAbove5000Sqft: ['', [this.formValidationSvc.numericTwoDecimal]],
      minPriceBelow5000Sqft: ['', [this.formValidationSvc.numericTwoDecimal, this.minValidatorWithOtheField('priceBelow5000Sqft')]],
      minPriceAbove5000Sqft: ['', [this.formValidationSvc.numericTwoDecimal, this.minValidatorWithOtheField('priceAbove5000Sqft')]],
      bonusMonth: ['', [this.formValidationSvc.numericOnly]],
      max_split_payment: ['', [this.formValidationSvc.numericOnly]],
      show_website: [true],
      active_status: [true],
    })
    this.planTermsForm.reset();
    this.planTermsForm.clearValidators();
    this.submitted = false;
    setTimeout(() => {
      this.planTermsForm.patchValue({
        planId: '',
        planTerm: '',
        propertyType: '',
        priceBelow5000Sqft: 0,
        priceAbove5000Sqft: 0,
        minPriceBelow5000Sqft: 0,
        minPriceAbove5000Sqft: 0,
        bonusMonth: 0,
        max_split_payment: 0

      });
    }, 250);
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {
        this.getSelectedOptionText(obj.plan_term_month);
        let selectedProds: any = [];
        this.planTermsForm.patchValue({
          planId: obj.plan_id,
          planTerm: obj.plan_term_month,
          propertyType: obj.property_type_id,
          priceBelow5000Sqft: obj.price_below_5000_sqft,
          priceAbove5000Sqft: obj.price_above_5000_sqft,
          minPriceBelow5000Sqft: obj.min_price_below_5000_sqft,
          minPriceAbove5000Sqft: obj.min_price_above_5000_sqft,
          bonusMonth: obj.bonus_month,
          max_split_payment: obj.max_split_payment,
          show_website: obj.show_website?true:false,
          active_status: obj.active_status==1?true:false,
        });
      }, 250);

    }

    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 350);
  }


  openViewPlanTermModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-md view-modal', backdrop: 'static' });
    this.viewObj = obj
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
    console.log(this.planTermsForm);
    
    // return

    if (this.planTermsForm.valid) {
      if (this.isEdit) {
        this.getSelectedOptionText(this.f['planTerm'].value);
      }
      let data = {
        planId: this.f['planId'].value,
        planTerm: this.selectedTenure,
        planTermMonth: this.f['planTerm'].value,
        propertyType: this.f['propertyType'].value,
        priceBelow5000Sqft: this.f['priceBelow5000Sqft'].value,
        priceAbove5000Sqft: this.f['priceAbove5000Sqft'].value,
        minPriceBelow5000Sqft: this.f['minPriceBelow5000Sqft'].value,
        minPriceAbove5000Sqft: this.f['minPriceAbove5000Sqft'].value,
        bonusMonth: this.f['bonusMonth'].value,
        max_split_payment: this.f['max_split_payment'].value,
        show_website: this.f['show_website'].value?true:false,
        active_status: this.f['active_status'].value?1:0,
      }


      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.plansterms.updatePlanTerms}/${this.editObj.plan_terms_id}`, data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.selectedProducts = [];
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getPlansTermList();

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
        this.apiSvc.post(AppConfig.apiUrl.plansterms.createPlanTerms, data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.selectedProducts = [];
              this.alertService.success(response.message);
              this.modalRef?.hide();
              setTimeout(() => {
                this.getPlansTermList();
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
      this.formValidationSvc.validateAllFormFields(this.planTermsForm);
    }

  }

  deletePlanTerm(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.plan_term} plan term ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.plansterms.deletePlanTerms}/${obj.plan_terms_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getPlansTermList();
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

  changeActivationStatus(ev: any, planId: any) {
    console.log('ev', ev.target.checked);
    this.apiSvc.put(`${AppConfig.apiUrl.plansterms.togglePlanTermsStatus}/${planId}`, { 'activeStatus': ev.target.checked ? 1 : 0 }).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          // this.getPlansTermList();
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
    this.getPlansTermList();
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
        this.getPlansTermList()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getPlansTermList()
    }
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/plan-management/plan-term');
    this.getPlansTermList();
  }
  resetAllFilter(){
    this.searchingvalue='';
    this.getPlansTermList()
  }
}
