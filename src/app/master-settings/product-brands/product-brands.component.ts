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
import { Subscription } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-product-brands',
  templateUrl: './product-brands.component.html',
  styleUrls: ['./product-brands.component.scss']
})
export class ProductBrandsComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  BrandForm: any;
  public submitted!: boolean;
  public productList: any;
  loading: boolean = false;
  isEdit: boolean = false;
  permissionObj: any
  brandList:any=[]
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
  searchingvalue: any = '';
  resetSearchInput = false;
  sortField: string = 'product_brand_id'; // Default sorting field
  sortOrder: string = 'ASC'; // Default sorting order
  updateId: any;

  
  

  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService,
    private confrmSvc: ConfirmationDialogService,
  ) {
    
    this.commonSvc.setTitle('Products Brand');
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
    //   // Now you can work with the resolved data
    // });
  }

  ngOnInit() {
    this.getBrandsList();
  }





  getBrandsList(){
    this.loading = true;
    let url=`${AppConfig.apiUrl.brands.getAllBrands}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`
      this.apiSvc.get(url).subscribe({
        next: (val: any) => {
          this.paginationObj = val?.pagination;
          this.brandList = val?.data;
          this.loading = false;
        },
        error: (e) => {
          this.loading = false;
          this.alertService.error(e.message || 'Someting went wrong!');
        },
      });
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/master-settings/product-brands');
    this.getBrandsList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/master-settings/product-brands'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getBrandsList();
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

  openViewBrandModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-m view-modal modal-md', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditBrandModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditBrandModal(template, obj);
    }, 200);
  }

  get f() { return this.BrandForm.controls; }

  openAddEditBrandModal(template: TemplateRef<any>, obj: any) {
    this.updateId=obj.product_brand_id;
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.BrandForm = this.fb.group({
      brand_name:[obj.brand_name?obj.brand_name:'',[Validators.required]]
    });
    if(obj){
      this.isEdit = true;
    }else{
      this.isEdit = false; 
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);

  }

  closeAddEditModal(){
    this.submitted = false;
    this.BrandForm.reset();
    this.modalRef?.hide();
    setTimeout(() => {
      this.loading = false;
      this.isEdit = false;
    }, 400);
    //this.getBrandsList();
  }

  onSubmit(){
    this.loading = true;
    if (this.BrandForm.valid) {
      let data:any={};
      if (this.updateId) {
        data={...this.BrandForm.value,updateId:this.updateId};
      }else{
        data=this.BrandForm.value;
      }
      this.apiSvc.post(AppConfig.apiUrl.brands.createProductBrand, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);     
            this.modalRef?.hide();
            this.loading = false;
            this.getBrandsList()
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
    }else{
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.BrandForm);
    }
  }

  deleteBrand(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.brands.deleteBrand}/${obj.product_brand_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getBrandsList();
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
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} product brand ${obj.brand_name} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.post(AppConfig.apiUrl.brands.updateProductBrandStatus, { 'active_status': obj.active_status ? 0 : 1 ,updateId:obj.product_brand_id}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getBrandsList();
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
  get brandForm(): any {
    return this.BrandForm.get('brand_name') as FormArray;
  }
}
