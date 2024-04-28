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
  selector: 'app-service-call-fee',
  templateUrl: './service-call-fee.component.html',
  styleUrls: ['./service-call-fee.component.scss']
})
export class ServiceCallFeeComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  ScfForm: any;
  public submitted!: boolean;
  public productList: any;
  loading: boolean = false;
  isEdit: boolean = false;
  permissionObj: any
  scfList:any=[]
  planTermList:any=[]
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
  plan_term: any = '';
  resetSearchInput = false;
  sortField: string = 'month'; // Default sorting field
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
    
    this.commonSvc.setTitle('Service claim fee');
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
  }

  ngOnInit() {
    this.getPlansTermList();
    
  }

  getPlansTermList() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getPlanTerms}`).subscribe({
      next: (val: any) => { 
        this.planTermList = val?.data;      
        this.getScfList();
      }
      
    });
  }
  planTermChange(item:any){
     this.getScfList()
  }

  getScfList(){
    this.loading = true;
    let url=`${AppConfig.apiUrl.serviceCallFees.getAllServiceCallfees}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.plan_term ? `&month=${this.plan_term}` : ''}`
      this.apiSvc.get(url).subscribe({
        next: (val: any) => {
          this.paginationObj = val?.pagination;
          this.scfList = val?.data;
          this.scfList.map((item:any)=>{
            this.planTermList.map((el:any)=>{
              if(item.month==el.plan_term_month){
                item.plan_term=el.plan_term
              }
            })
          })
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
    this.commonSvc.resetPagination(this.paginationObj,'/master-settings/scf');
    this.getScfList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/master-settings/scf'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getScfList();
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

  updateSorting(columnName: string) {
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    this.getScfList();
  }

  openViewModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-m view-modal modal-md', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditModal(template, obj);
    }, 200);
  }

  get f() { return this.ScfForm.controls; }

  openAddEditModal(template: TemplateRef<any>, obj: any) {
    this.updateId=obj.service_call_fees_id;
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-md', backdrop: 'static' });
    this.ScfForm = this.fb.group({
      month:[obj.month?obj.month:'',[Validators.required]],
      scf_value:[obj.scf_value?obj.scf_value:'',[Validators.required]]
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
    this.ScfForm.reset();
    this.modalRef?.hide();
    setTimeout(() => {
      this.loading = false;
      this.isEdit = false;
    }, 400);
    //this.getScfList();
  }

  onSubmit(){
    if (this.ScfForm.valid) {
      this.loading = true;
      let data:any={};
      if (this.updateId) {
        data={...this.ScfForm.value,updateId:this.updateId};
      }else{
        data=this.ScfForm.value;
      }
      this.apiSvc.post(AppConfig.apiUrl.serviceCallFees.createScf, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);     
            this.modalRef?.hide();
            this.loading = false;
            this.getScfList()
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
      this.formValidationSvc.validateAllFormFields(this.ScfForm);
    }
  }

  // deleteBrand(obj: any) {
  //   this.confrmSvc.confirm('Are you sure', `Do you really want to delete ?`, 'Yes', 'No', 'lg').then((res) => {
  //     if (res) {
  //       this.apiSvc.delete(`${AppConfig.apiUrl.brands.deleteBrand}/${obj.product_brand_id}`).subscribe({
  //         next: (response: any) => {
  //           if (response.status == 1) {
  //             this.alertService.success(response.message);
  //             this.getScfList();
  //             this.loading = false;
  //           } else {
  //             this.alertService.error(response.message);
  //           }
  //         },
  //         error: () => {
  //           this.loading = false;
  //         },
  //         complete: () => {
  //           this.loading = false;
  //         }
  //       });
  //     }
  //   })
  //     .catch(() => { });
  // }

  get brandForm(): any {
    return this.ScfForm.get('brand_name') as FormArray;
  }


  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} service call fee ${obj.scf_value} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.post(AppConfig.apiUrl.serviceCallFees.updateScfSatus, { 'active_status': obj.active_status ? 0 : 1 ,updateId:obj.service_call_fees_id}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getScfList();
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
}
