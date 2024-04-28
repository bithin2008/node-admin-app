import { Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-terms-master',
  templateUrl: './terms-master.component.html',
  styleUrls: ['./terms-master.component.scss'],
})
export class TermsMasterComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};
  termDetailsForm: any;
  submitted!: boolean;
  productList: any;
  loading: boolean = false;
  isEdit: boolean = false;
  permissionObj: any;
  termDataList: any = [];
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  };
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  searchingvalue: any = '';
  resetSearchInput = false;
  sortField: string = 'term_month'; // Default sorting field
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
    private confrmSvc: ConfirmationDialogService
  ) {
    this.commonSvc.setTitle('Terms Master');
    this.activatedRoute.queryParams.subscribe((params) => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first =
        (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
    const currentRoute: any = this.router.routerState.snapshot.url
      .split('?')[0]
      .substring(1);
    const permissionObj = checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj;
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      }
    }
  }

  ngOnInit() {
    this.getAllTermList();
  }

  getAllTermList() {
    this.loading = true;
    let url = `${AppConfig.apiUrl.termsMaster.getAllTerms}?page=${
      this.paginationObj.currentPage
    }&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${
      this.sortOrder
    }${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`;
    this.apiSvc.get(url).subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.termDataList = val?.data;
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.alertService.error(e.message || 'Someting went wrong!');
      },
    });
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str;
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(
      this.paginationObj,
      '/master-settings/terms-master'
    );
    this.getAllTermList();
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows;
    }
    this.router.navigate(['/master-settings/terms-master'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit,
      },
      queryParamsHandling: 'merge',
    });
    this.getAllTermList();
  }

  resetPagination() {
    this.paginationObj = {
      first: 0,
      currentPage: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    };
  }

  openViewModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, {
      class: 'modal-m view-modal modal-md',
      backdrop: 'static',
    });
    this.viewObj = obj;
  }

  openEditModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditModal(template, obj);
    }, 200);
  }

  get f() {
    return this.termDetailsForm.controls;
  }

  openAddEditModal(template: TemplateRef<any>, obj: any) {
    this.updateId = obj.term_master_id;
    this.modalRef = this.mdlSvc.show(template, {
      id: 1,
      class: 'modal-lg',
      backdrop: 'static',
    });
    this.termDetailsForm = this.fb.group({
      termName: [obj.term_name ? obj.term_name : '', [Validators.required]],
      termMonth: [obj.term_month ? obj.term_month : '', [Validators.required]],
    });
    if (obj) {
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);
  }

  closeAddEditModal() {
    this.submitted = false;
    this.termDetailsForm.reset();
    this.modalRef?.hide();
    setTimeout(() => {
      this.loading = false;
      this.isEdit = false;
    }, 400);
  }

  onSubmit() {
    if (this.termDetailsForm.valid) {
      this.loading = true;
      const url = this.updateId
        ? `${AppConfig.apiUrl.termsMaster.updateTerm}/${this.updateId}`
        : AppConfig.apiUrl.termsMaster.createTerm;
      const method = this.updateId ? 'put' : 'post';
      const formData = this.termDetailsForm.value;
      this.apiSvc[method](url, formData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);
            this.modalRef?.hide();
            this.loading = false;
            this.getAllTermList();
          } else {
            this.alertService.error(response.message);
          }
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.termDetailsForm);
    }
  }

  deleteTerm(obj: any) {
    this.confrmSvc
      .confirm(
        'Are you sure',
        `Do you really want to delete this item ?`,
        'Yes',
        'No',
        'lg'
      )
      .then((res) => {
        if (res) {
          this.apiSvc
            .delete(
              `${AppConfig.apiUrl.termsMaster.deleteTerm}/${obj.term_master_id}`
            )
            .subscribe({
              next: (response: any) => {
                if (response.status == 1) {
                  this.alertService.success(response.message);
                  this.getAllTermList();
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
              },
            });
        }
      })
      .catch(() => {});
  }

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc
      .confirm(
        'Are you sure',
        `Do you really want to ${
          ev.target.checked ? 'active' : 'inactive'
        } the Term ${obj.term_name} ?`,
        'Yes',
        'No',
        'lg'
      )
      .then((res) => {
        if (res) {
          this.apiSvc
            .put(
              `${AppConfig.apiUrl.termsMaster.toggleTermStatus}/${obj.term_master_id}`,
              {
                activeStatus: obj.active_status ? 0 : 1,
              }
            )
            .subscribe({
              next: (response: any) => {
                if (response.status == 1) {
                  this.alertService.success(response.message);
                  setTimeout(() => {
                    this.getAllTermList();
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
              },
            });
        } else {
          obj.active_status = previousActiveStatus;
        }
      })
      .catch(() => {
        obj.active_status = previousActiveStatus;
      });
  }

  updateSorting(columnName: string) {
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    this.getAllTermList();
  }

  allowOnlyNumber(event: any) {
    let inputValue: any = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');
    this.termDetailsForm.patchValue({
      termMonth: inputValue
    });
  }
}
