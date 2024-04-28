import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from "lodash";
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { base64ToFile } from 'ngx-image-cropper';
import { Subject, Subscription, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ImageCropperWrapperComponent } from 'src/app/@shared/components/image-cropper-wrapper/image-cropper-wrapper.component';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../@core/services/shared.service';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-comission-master-settings',
  templateUrl: './comission-master-settings.component.html',
  styleUrls: ['./comission-master-settings.component.scss']
})
export class ComissionMasterSettingsComponent {
  modalRef?: BsModalRef | null;
  inputSubject = new Subject<string>();
  duplicateCheckArr: any = [];
  cropperModalRef?: BsModalRef;
  viewModalRef?: BsModalRef | null;
  orgModuleSubmodulePermissionRef?: BsModalRef | null;
  viewObj: any = {};
  commissionTypeForm: any;
  policyTermList: any = [];
  sortBy: any;
  sortField: string = 'commission_type_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  public commissionTypeList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  editObjClone: any = {};
  authorImage: any;
  blogImage: any;
  permissionObj: any;
  minDate: any;
  subModulesgroupByModuleList: any
  selectedModules: boolean[] = [];
  selectedSubmodules: boolean[][] = [];
  productList: any = [];
  blogCategoryList: any = [];

  selectedOrgId: any
  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  searchingvalue: any = ''
  subject: any;

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/commission-management/comission-master-settings'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getCommissionTypesList();
  }
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    public formBuilder: UntypedFormBuilder,
    private validator: FormValidationService,
    private activatedRoute: ActivatedRoute,
    private commonSvc: CommonService,
    private alertSvc: AlertService,
    private router: Router,
    private bsMdlSvc: BsModalService,
    private sharedService: SharedService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.commonSvc.setTitle('Organizations');
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
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }
  ngOnInit(): void {
    this.getCommissionTypesList();
  }

  async openAddEditCommisionTypeModal(template: TemplateRef<any>, obj: any) {
    
    this.isEdit = false;
    let policyTerms: any = await this.getPlansTermList();
    const groupedData = policyTerms.data.reduce((result: any, item: any) => {
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
    this.policyTermList = groupedArray;

    this.commissionTypeForm = this.fb.group({
      commissionType: ['1', [Validators.required]],
      policyTerm: ['', [Validators.required]],
      lowerLimit: ['', [Validators.required, this.validator.numericTwoDecimal]],
      upperLimit: ['', [Validators.required, this.validator.numericTwoDecimal]],
      pricePercentage: [0, [Validators.required]],
      commissionValue: ['', [Validators.required, this.validator.numericTwoDecimal]],
      commissionTimes: ['', [Validators.required, this.validator.numericOnly]],
      spiffAmount: [''],
      oneDaySaleAmount: [''],
      activeStatus: ['1', [Validators.required]],
    })


    this.modalRef = this.bsMdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });
    let selectCommissionType:any = document.getElementById('commissionType');
    selectCommissionType.disabled = false
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
   
      setTimeout(() => {
        this.commissionTypeForm.patchValue({
          commissionType: obj.commission_type,
          policyTerm: obj.total_months?obj.total_months:null,
          lowerLimit: obj.lower_limit?obj.lower_limit:null,
          upperLimit: obj.upper_limit?obj.upper_limit:null,
          pricePercentage: obj.price_percentage==0?0:1,
          commissionValue: obj.commission_value?obj.commission_value:null,
          commissionTimes: obj.commission_times?obj.commission_times:null,
          spiffAmount: obj.spiff_amount?obj.spiff_amount:null,
          oneDaySaleAmount: obj.one_day_sale_amount?obj.one_day_sale_amount:null,
          activeStatus: obj.active_status.toString(),
          description: obj.description,
        });  

        let selectCommissionType:any = document.getElementById('commissionType');
        selectCommissionType.disabled = true
      }, 300);
      this.editObjClone = { ...this.editObj };
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);
  }

  async getPlansTermList() {
    try {
      const response = await this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlanTerms}?active_status=1`).toPromise();
      return response;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw the error for handling in the calling function.
    }
  }

  changeCommissionType() {


    for (const key in this.commissionTypeForm.controls) {
      this.commissionTypeForm.get(key).clearValidators();
      this.commissionTypeForm.get(key).updateValueAndValidity();
    }
    this.submitted = false;


    if (this.commissionTypeForm.controls['commissionType'].value == 1) {
      this.commissionTypeForm.controls['policyTerm'].setValidators([Validators.required]);
      this.commissionTypeForm.controls['lowerLimit'].setValidators([Validators.required, this.validator.numericTwoDecimal]);
      this.commissionTypeForm.controls['upperLimit'].setValidators([Validators.required, this.validator.numericTwoDecimal]);
      this.commissionTypeForm.controls['pricePercentage'].setValidators([Validators.required]);
      this.commissionTypeForm.controls['commissionValue'].setValidators([Validators.required, this.validator.numericTwoDecimal]);
      this.commissionTypeForm.controls['commissionTimes'].setValidators([Validators.required, this.validator.numericOnly]);

      this.commissionTypeForm.controls['policyTerm'].updateValueAndValidity();
      this.commissionTypeForm.controls['lowerLimit'].updateValueAndValidity();
      this.commissionTypeForm.controls['upperLimit'].updateValueAndValidity();
      this.commissionTypeForm.controls['pricePercentage'].updateValueAndValidity();
      this.commissionTypeForm.controls['commissionValue'].updateValueAndValidity();
      this.commissionTypeForm.controls['commissionTimes'].updateValueAndValidity();

      this.commissionTypeForm.patchValue({
        commissionValue:this.f['commissionValue'].value?this.f['commissionValue'].value:null,
      })
    }

    if (this.commissionTypeForm.controls['commissionType'].value == 2) {

      this.commissionTypeForm.controls['commissionValue'].setValidators([Validators.required, this.validator.numericTwoDecimal]);
      this.commissionTypeForm.controls['spiffAmount'].setValidators([Validators.required, this.validator.numericTwoDecimal]);
      this.commissionTypeForm.controls['commissionValue'].updateValueAndValidity();
      this.commissionTypeForm.controls['spiffAmount'].updateValueAndValidity();

      this.commissionTypeForm.patchValue({
        commissionValue:this.f['commissionValue'].value?this.f['commissionValue'].value:null,
        spiffAmount:this.f['spiffAmount'].value?this.f['spiffAmount'].value:null
      })

    }
    if (this.commissionTypeForm.controls['commissionType'].value == 3) {
      this.commissionTypeForm.controls['commissionValue'].setValidators([Validators.required, this.validator.numericTwoDecimal]);
      this.commissionTypeForm.controls['oneDaySaleAmount'].setValidators([Validators.required, this.validator.numericTwoDecimal]);

      this.commissionTypeForm.patchValue({
        commissionValue:this.f['commissionValue'].value?this.f['commissionValue'].value:null,
        oneDaySaleAmount:this.f['oneDaySaleAmount'].value?this.f['oneDaySaleAmount'].value:null
      })
    }
    setTimeout(() => {
        this.commissionTypeForm.updateValueAndValidity();
      this.formValidationSvc.forms();
    }, 250);
  }


  openViewOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.bsMdlSvc.show(template, { class: 'modal-lg view-modal', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditOrgModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditCommisionTypeModal(template, obj);
    }, 200);
  }

  get f() { return this.commissionTypeForm.controls; }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
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
    this.getCommissionTypesList();
  }

  getCommissionTypesList() {
    this.apiSvc.get(`${AppConfig.apiUrl.commissions.getAllCommissionTypes}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`).subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.commissionTypeList = val?.data;
        this.loading = false;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getCommissionTypesList();
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


  onSubmit() {
    this.submitted = true;
    this.loading = true;


    if (this.commissionTypeForm.valid) {
      if (this.commissionTypeForm.controls['commissionType'].value == 1) {
        if (this.commissionTypeForm.controls['upperLimit'].value <= this.commissionTypeForm.controls['lowerLimit'].value) {
          this.alertSvc.warning('Lower limit can\'t be greater than Upper Limit ');
          this.loading = false;
          return;
        }
      }
      if (this.isEdit) {
        if (this.commissionTypeForm.value.policyTerm) {
          let pTerm: any = document.getElementById('pTerm');
          this.commissionTypeForm.value['totalMonths'] = this.commissionTypeForm.value.policyTerm
          this.commissionTypeForm.value['policyTerm'] = pTerm.options[pTerm.selectedIndex].innerHTML
        }
        this.apiSvc.put(`${AppConfig.apiUrl.commissions.updateCommissionType}/${this.editObj.commission_type_id}`, this.commissionTypeForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.modalRef?.hide();
              this.alertSvc.success(response.message);
              this.submitted = false;
              setTimeout(() => {
                this.getCommissionTypesList();
              }, 500);

            } else {
              this.alertSvc.error(response.message);
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
        console.log(this.commissionTypeForm.value);
        if (this.commissionTypeForm.value.policyTerm) {
          let pTerm: any = document.getElementById('pTerm');
          this.commissionTypeForm.value['totalMonths'] = parseInt(this.commissionTypeForm.controls['policyTerm'].value)
          this.commissionTypeForm.value['policyTerm'] = pTerm.options[pTerm.selectedIndex].innerHTML.trim()
        }


        this.apiSvc.post(AppConfig.apiUrl.commissions.createCommissionType, this.commissionTypeForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.submitted = false;
              this.commissionTypeForm.reset();
              this.modalRef?.hide();
              this.alertSvc.success(response.message);
              setTimeout(() => {
                this.getCommissionTypesList();
              }, 500);
            } else {
              this.alertSvc.error(response.message);
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
      this.formValidationSvc.validateAllFormFields(this.commissionTypeForm);
    }
  }

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} this commission type ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.commissions.toggleActiveStatus}/${obj.commission_type_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              setTimeout(() => {
                this.getCommissionTypesList();
              }, 250);
            } else {
              this.alertSvc.error(response.message);
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
        this.cdRef.detectChanges();
      }
    })
      .catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  }

  deleteCommissionType(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete commission type ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.commissions.deleteCommissionType}/${obj.commission_type_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.getCommissionTypesList();
              this.loading = false;
            } else {
              this.alertSvc.error(response.message);
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





  closeAddEditCommisionTypeModal() {
    this.submitted = false;
    this.commissionTypeForm.reset();
    this.modalRef?.hide();
    this.editObj = {}
    this.loading = false;
    this.isEdit = false;
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
        this.getCommissionTypesList();
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getCommissionTypesList();
    }
  }

  changePublishDate(ev: any) {
    if (ev) {
      this.commissionTypeForm.patchValue({
        publishDate: new Date(ev),
      })
      this.formValidationSvc.forms();
    }
  }
}
