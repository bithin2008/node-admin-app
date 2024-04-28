import { Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/@core/services/common.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-property-size',
  templateUrl: './property-size.component.html',
  styleUrls: ['./property-size.component.scss']
})
export class PropertySizeComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  propertySizeList: any = [];
  propertySizeForm: any;
  submitted!: boolean;
  loading: boolean = false;
  isEdit: boolean = false;
  permissionObj: any

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
  sortField: string = 'property_size_id'; // Default sorting field
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
    
    this.commonSvc.setTitle('Property Size');
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
    this.getPaymentStatusList();
  }





  getPaymentStatusList(){
    this.loading = true;
    let url=`${AppConfig.apiUrl.propertySize.getPropertySizeList}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`
      this.apiSvc.get(url).subscribe({
        next: (val: any) => {
          this.paginationObj = val?.pagination;
          this.propertySizeList = val?.data;
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
    this.commonSvc.resetPagination(this.paginationObj,'/master-settings/property-size');
    this.getPaymentStatusList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/master-settings/property-size'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getPaymentStatusList();
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

  get f() { return this.propertySizeForm.controls; }

  openAddEditModal(template: TemplateRef<any>, obj: any) {  
    this.updateId=obj.property_size_id;
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' });
    this.propertySizeForm = this.fb.group({
      property_size:[obj.property_size?obj.property_size:'',[Validators.required]],
      value:[obj.value || obj.value==0?obj.value:'',[Validators.required]],
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
    this.propertySizeForm.reset();
    this.modalRef?.hide();
    setTimeout(() => {
      this.loading = false;
      this.isEdit = false;
    }, 400);
    //this.getPriorityList();
  }

  onSubmit(){
    if (this.propertySizeForm.valid) {
      this.loading = true;
      let data:any={};
      if (this.updateId) {
        data={...this.propertySizeForm.value,updateId:this.updateId};
      }else{
        data=this.propertySizeForm.value;
      }
      this.apiSvc.post(AppConfig.apiUrl.propertySize.createPropertySize, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);     
            this.modalRef?.hide();
            this.loading = false;
            this.getPaymentStatusList()
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
      this.formValidationSvc.validateAllFormFields(this.propertySizeForm);
    }
  }

  deletePriority(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.propertySize.deletePropertySize}/${obj.property_size_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getPaymentStatusList();
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
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} Property size ${obj.property_size} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.post(AppConfig.apiUrl.propertySize.updatePropertySize, { 'active_status': obj.active_status ? 0 : 1 ,updateId:obj.property_size_id}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getPaymentStatusList();
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