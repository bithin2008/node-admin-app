import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { SystemAdminApiService } from 'src/app/@core/services/system-admin-api.service';


@Component({
  selector: 'app-system-admin-modules',
  templateUrl: './system-admin-modules.component.html',
  styleUrls: ['./system-admin-modules.component.scss']
})
export class SystemAdminModulesComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewIconsModalRef?: BsModalRef | null;
  viewObj: any = {};
  moduleForm: any;
  sortBy: any;
  sortDirection: boolean = false;
  public submitted!: boolean;
  public events: any[] = [];
  public systemAdminModuleList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  isView: boolean = false;
  editObj: any = {};
  showTableDataLoading = false;


  // Pagination Config
  paginationObj = {
    // The number of elements in the page
    limit: 20,
    // The total number of elements
    total: 10,
    // The total number of pages
    totalPages: 1,
    // The current page number
    currentPage: 1,
  };
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  // table proprty
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  public columns = [{ name: '#' }, { name: 'Actions' }, { name: 'Module Name', prop: 'module_name' }, { name: 'Icon' }, { name: "Sequence" }, { name: "Status" }] as any
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  editing = {} as any;
  primeIcons: any = {};
  searchKeyword: any = '';
  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    this.getSystemAdminModulesList();
  }
  constructor(
    private apiSvc: SystemAdminApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private IconService: IconService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService
  ) {
    this.commonSvc.setTitle('Modules');
  }

  ngOnInit(): void {
    this.getAllicons();

    this.moduleForm = this.fb.group({
      moduleName: ['', [Validators.required, this.formValidationSvc.notEmpty,this.formValidationSvc.noSpecialCharacters()]],
      descriptions: [''],
      route_path:[''],
      icon: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      sequence: [null, Validators.min(0),],
      activeStatus: ['1', [Validators.required]]
    })
    //   this.alertService.success('TEST');
    //  setTimeout(() => {
    //   this.alertService.error('TEST');
    //  }, 1500);

    //this.toastSvc.success('TEST', 'Success');
    this.getSystemAdminModulesList();
  }

  get f() { return this.moduleForm.controls; }

  sort(column: string) {
    if (column === this.sortBy) {
      this.sortDirection = !this.sortDirection;
    } else {
      this.sortBy = column;
      this.sortDirection = false;
    }
  }

  onDetailToggle(event: any) {
    console.log('Detail Toggled', event);
  }

  getSystemAdminModulesList() {
    this.showTableDataLoading = true;
    this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getSystemAdminModules}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&moduleName=${this.searchKeyword}`).subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.systemAdminModuleList = val?.data;
        // Initialize the isValid property for each item in the systemAdminModuleList
        this.systemAdminModuleList.forEach((item: any) => {
          item.isValid = true;
        });
        this.loading = false;
      }, error: () => { }, complete: () => { this.showTableDataLoading = false }
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getSystemAdminModulesList();
  }

  resetPagination() {
    this.paginationObj.currentPage = 1;
    this.paginationObj.total = 0;
    this.paginationObj.limit = 10;
    this.paginationObj.totalPages = 1;
  }

  openaddEditModuleModal(template: TemplateRef<any>, obj: any) {
    this.modalRef = this.mdlSvc.show(template, { backdrop: 'static' });
    if (Object.keys(obj).length > 0) {
      this.isEdit = true;
      this.editObj = obj;
      this.moduleForm.patchValue({
        moduleName: obj.module_name,
        descriptions: obj.descriptions,
        route_path:obj?.route_path,
        icon: obj.icon,
        sequence: obj.sequence,
        activeStatus: obj.active_status.toString()
      });
    }
    this.moduleForm.patchValue({
      icon: `pi-pi-minus`
    })
    setTimeout(() => {
      this.formValidationSvc.forms()
    }, 200);  }

  openViewModuleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-sm view-modal',backdrop: 'static' });
    this.viewObj = obj
  }

  openEditModuleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openaddEditModuleModal(template, obj);
      this.formValidationSvc.forms()

    }, 200);
  }

  preventSpace(e: any): any {
    if (e.which === 32 && !e.target.value.length) {
      e.preventDefault();
    }
  }

  openViewIconsModal(template: TemplateRef<any>) {
    this.viewIconsModalRef = this.mdlSvc.show(template, { id:'icon-modal', class: 'modal-lg',backdrop: 'static' });
   
  }

  getAllicons() {
    this.primeIcons = this.IconService.getPrimeIcons();
    console.log('primeIcons', this.primeIcons);
  }

  selectIcon(obj: any) {
    this.moduleForm.patchValue({
      icon: `pi-${obj.properties.name}`
    })
    setTimeout(() => {
      // this.viewIconsModalRef?.hide()
      this.mdlSvc.hide('icon-modal')
    }, 100);
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.moduleForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateSystemAdminModule}/${this.editObj.module_id}`, this.moduleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.closeaddEditModuleModal()
              this.getSystemAdminModulesList();
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
        this.apiSvc.post(AppConfig.apiUrl.systemAdmin.addSystemAdminModule, this.moduleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.closeaddEditModuleModal()
              this.getSystemAdminModulesList();
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
      this.formValidationSvc.validateAllFormFields(this.moduleForm);
    }

  }

  deleteModule(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.module_name} module ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.systemAdmin.deleteSystemAdminModule}/${obj.module_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getSystemAdminModulesList();
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

  changeActivationStatus(ev: any, moduleId: any) {
    this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.toggleSystemAdminModuleStatus}/${moduleId}`, { 'activeStatus': ev.target.checked ? 1 : 0 }).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          this.loading = false;
          this.getSystemAdminModulesList();
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
  closeaddEditModuleModal() {
    this.submitted = false;
    this.moduleForm.reset();
    this.moduleForm.patchValue({
      activeStatus: '1'
    });
    this.modalRef?.hide();
    this.isEdit=false
  }
  updateFilter(ev: any) {
    if (ev.target.value.length >= 3) {
      this.getSystemAdminModulesList()
    }
    if (ev.target.value.length == 0) {
      this.getSystemAdminModulesList()
    }
  }
  toggleExpandRow(row: any) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }
  validateInlineModuleName(cell: any, value: string) {
    // Add validation checks
    if (cell === 'moduleName') {
      // Check if the value is not empty and has at least 3 characters
      const newValue = value;
      if (newValue.trim() === '' || newValue.length < 3) {
        alert('Module Name must have at least 3 characters and cannot be empty.');
        return; // Do not proceed with the update if validation fails
      }
    }
  }
  editInline(rowIndex: number, cell: any) {
    this.editing[rowIndex + '-module_name'] = true;
    this.moduleForm.patchValue({
      moduleName: this.systemAdminModuleList[rowIndex].module_name,
      descriptions: this.systemAdminModuleList[rowIndex].descriptions,
      route_path: this.systemAdminModuleList[rowIndex].route_path,
      icon: this.systemAdminModuleList[rowIndex].icon,
      sequence: this.systemAdminModuleList[rowIndex].sequence,
      activeStatus: this.systemAdminModuleList[rowIndex].active_status.toString()
    })
  //  console.log(this.moduleForm);

  }
  updateInlineValue(event: any, cell: any, rowIndex: any) {
    if (!this.moduleForm.valid)
      return
    //  console.log('inline editing rowIndex', rowIndex);
    // this.systemAdminModuleList[rowIndex][cell] = event.target.value;
    // this.systemAdminModuleList = [...this.systemAdminModuleList];
    // console.log('UPDATED! ',cell, this.systemAdminModuleList[rowIndex][cell]);
    let payLoad = {} as any;
    payLoad[cell] = event.target.value;

    this.apiSvc.put(`${AppConfig.apiUrl.systemAdmin.updateSystemAdminModule}/${this.systemAdminModuleList[rowIndex].module_id}`, payLoad).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          this.modalRef?.hide();
          this.getSystemAdminModulesList();
          this.loading = false;
          this.editing[rowIndex + '-module_name'] = false;

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


