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
  selector: 'app-product-problems',
  templateUrl: './product-problems.component.html',
  styleUrls: ['./product-problems.component.scss']
})
export class ProductProblemsComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  ProductIssueForm: any;
  public submitted!: boolean;
  public productList: any;
  loading: boolean = false;
  isEdit: boolean = false;
  permissionObj: any
  productProblemList:any=[]
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
  sortField: string = 'product_id'; // Default sorting field
  sortOrder: string = 'ASC'; // Default sorting order
  updateId: any;
  advanceFilter: any
  advancedSearchConfig: any = {
    inputConfig: [
      {isDisplay:true , propertyName:'product_id', value:'', placeholder:'Select',label:'Product Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
    ]
  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
    this.advanceFilter = event.searchQuery
    // console.log(this.advanceFilter);
    this.getProductsProblemList();
  }

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
    
    this.commonSvc.setTitle('Products Problems');
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
    this.getProductsProblemList();
    this.getProductsList();
    
  }

  getProductsList() {
    this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1`).subscribe({
      next: (val: any) => {
        this.productList = val?.data;
        if (this.productList?.length>0){
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='product_id') {
              this.productList.forEach((el:any) => {
                element.data.push({key:el.product_name,value:el.product_id})
              });
            }
          });
        }
      }
    });
  }



  getProductsProblemList(){
    let url=`${AppConfig.apiUrl.products.getAllProductsProblems}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}${this.advanceFilter?this.advanceFilter:''}`
      this.apiSvc.get(url).subscribe({
        next: (val: any) => {
          this.paginationObj = val?.pagination;
          this.productProblemList = val?.data;
        }
      });
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/product-management/product-issue-type');
    this.getProductsProblemList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/product-management/product-issue-type'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getProductsProblemList();
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

  openViewProductModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-m view-modal modal-md', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditProductModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    // setTimeout(() => {
    //   this.openaddEditProductModal(template, obj);
    // }, 200);
  }

  get f() { return this.ProductIssueForm.controls; }

  openaddEditProductModal(template: TemplateRef<any>, obj: any) {
    this.updateId=obj.product_problem_id
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.ProductIssueForm = this.fb.group({
      product_id:[obj.product_id?obj.product_id:'',[Validators.required]],
      issue:[obj.problems?obj.problems:'',[Validators.required]]
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

  closeProductAddEditModal(){
    this.submitted = false;
    //this.ProductForm.reset();
    this.modalRef?.hide();
    this.loading = false;
    this.isEdit = false;
    //this.getProductsList();
  }

  onSubmit(){
    this.loading = true;
    if (this.ProductIssueForm.valid) {
      let data:any={};
      if (this.updateId) {
        data={...this.ProductIssueForm.value,updateId:this.updateId};
      }else{
        data=this.ProductIssueForm.value;
      }
      this.apiSvc.post(AppConfig.apiUrl.productProblems.createProductProblems, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);     
            this.modalRef?.hide();
            this.loading = false;
            this.getProductsProblemList()
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
  }


  get issueForm(): any {
    return this.ProductIssueForm.get('problems') as FormArray;
  }
}
