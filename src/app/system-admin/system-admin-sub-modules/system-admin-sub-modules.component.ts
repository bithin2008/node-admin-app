import { Component, OnInit, TemplateRef } from '@angular/core';
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
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { SystemAdminApiService } from 'src/app/@core/services/system-admin-api.service';

@Component({
  selector: 'app-system-admin-sub-modules',
  templateUrl: './system-admin-sub-modules.component.html',
  styleUrls: ['./system-admin-sub-modules.component.scss']
})
export class SystemAdminSubModulesComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewIconsModalRef?: BsModalRef | null;
  viewObj: any = {};
  subModuleForm: any;
  sortBy: any;
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  public systemAdminSubModuleList: any;
  public systemAdminModuleList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  primeIcons: any = {};
  selectedModule: any = '';

  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 10;
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  paginate(event: any) {
    this.first = event.page + 1;
    this.getSystemAdminSubModulesList();
  }
  constructor(
    private apiSvc: SystemAdminApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private commonSvc: CommonService,
    private IconService: IconService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService
  ) {
    this.commonSvc.setTitle('SubModules');
  }
  ngOnInit(): void {
    this.getAllicons();
    this.getSystemAdminSubModulesList();
    this.getSystemAdminModulesList();
  }

  get f() { return this.subModuleForm.controls; }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
    }
  }

  changeModule() {
    this.getSystemAdminSubModulesList();
  }

  getSystemAdminModulesList() {
    this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getSystemAdminModules}?active_status=1&page=1&limit=100`).subscribe({
      next: (val: any) => {
        this.systemAdminModuleList = val?.data;
      }
    });
  }

  getSystemAdminSubModulesList() {
    this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getSystemAdminSubModules}?module_id=${this.selectedModule}&page=${this.first}&limit=${this.itemPerPage}`).subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.systemAdminSubModuleList = val?.data;
        this.loading = false;
      }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getSystemAdminSubModulesList();
  }

  resetPagination() {
    this.currentPageIndex = 0;
    this.totalRecords = 0;
    this.itemPerPage = 10;
    this.first = 1;
  }

  preventSpace(e: any): any {
    if (e.which === 32 && !e.target.value.length) {
      e.preventDefault();
    }
  }

  openaddEditSubModuleModal(template: TemplateRef<any>, obj: any) {
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-lg',backdrop: 'static' });
    this.subModuleForm = this.fb.group({
      moduleId: ['', [Validators.required]],
      subModuleName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      descriptions: [''],
      route_path: ['', [Validators.required]],
      icon: ['pi-pi-minus', [Validators.required, this.formValidationSvc.notEmpty]],
      sequence: [null],
      activeStatus: ['1', [Validators.required]]
    })
    this.subModuleForm.reset();
    this.subModuleForm.clearValidators();
    this.submitted = false;
    setTimeout(() => {
      this.subModuleForm.patchValue({
        moduleId: "",
        activeStatus: '1',
        icon:'pi-pi-minus'
      });
    }, 250);
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      setTimeout(() => {
        this.subModuleForm.patchValue({
          moduleId: obj.module_id,
          subModuleName: obj.sub_module_name,
          descriptions: obj.descriptions,
          route_path: obj.route_path,
          icon: obj.icon,
          sequence: obj.sequence,
          activeStatus: obj.active_status.toString()
        });
      }, 250);

    }
    setTimeout(() => {
          this.formValidationSvc.forms()
    }, 450);
  }

  openViewSubModuleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-sm view-modal',backdrop: 'static' });
    this.viewObj = obj
  }

  openEditSubModuleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditSubModuleModal(template, obj);
      this.formValidationSvc.forms()
    }, 200);
  }

  openViewIconsModal(template: TemplateRef<any>) {
    this.viewIconsModalRef = this.mdlSvc.show(template, { id:'icon-modal', class: 'modal-lg',backdrop: 'static' });
    
  }

  getAllicons() {
    this.primeIcons = this.IconService.getPrimeIcons();
  }

  selectIcon(obj: any) {
    this.subModuleForm.patchValue({
      icon: `pi-${obj.properties.name}`
    })
    this.closeIconModal()
  }
closeIconModal(){
  this.modalService.hide('icon-modal');
    this.viewIconsModalRef?.hide()
}


  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.subModuleForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateSystemAdminSubModule}/${this.editObj.sub_module_id}`, this.subModuleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
             this.closeAddEditSubModuleModal()
             this.getSystemAdminSubModulesList();
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
        this.apiSvc.post(AppConfig.apiUrl.systemAdmin.addSystemAdminSubModule, this.subModuleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
             this.closeAddEditSubModuleModal()
              this.getSystemAdminSubModulesList();
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
      this.formValidationSvc.validateAllFormFields(this.subModuleForm);
    }

  }

  deleteSubModule(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.sub_module_name} submodule ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.systemAdmin.deleteSystemAdminSubModule}/${obj.sub_module_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getSystemAdminSubModulesList();
          
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
        
          },
          complete: () => {
        
          }
        });
      }
    })
      .catch(() => { });
  }

  changeActivationStatus(ev: any, moduleId: any) {
    this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.toggleSystemAdminSubModuleStatus}/${moduleId}`, { 'activeStatus': ev.target.checked ? 1 : 0 }).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          this.getSystemAdminSubModulesList();
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
  closeAddEditSubModuleModal(){
    this.isEdit=false;
    this.editObj={}
    this.submitted = false;
    this.subModuleForm.reset();
    this.modalRef?.hide()
    this.loading = false;

  }
}
