import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent {
  modalRef?: BsModalRef | null;
  viewModalRef?: BsModalRef | null;
  roleModuleSubmodulePermissionRef?: BsModalRef | null;
  viewObj: any = {};
  orgUserRoleForm: any;
  selectedOrg: any = '';
  sortBy: any;
  sortDirection: boolean = false;
  subModulesgroupByModuleList: any = [];
  public submitted!: boolean;
  public events: any[] = [];
  public orgUserRoleList: any = [];
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  isEdit: boolean = false;
  editObj: any = {};
  selectedRoleObj: any
  selectedRolePermissionData = [] as any
  isOpenPermissionModal = false
  permissionObj: any
  // Pagination Config
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };
  itemPerPageDropdown = [5,10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';

  sortField: string = 'user_role_id'; // Default sorting field
  sortOrder: string = 'desc'; // Default sorting order
  searchingvalue: any = ''
  resetSearchInput = false
  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/role-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getOrgUsersRoleList();
  }
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef
  ) {
    this.commonSvc.setTitle('Manage Role');
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
    // });
  }

  async ngOnInit(): Promise<void> {
    this.getAllModuleSubModulelistGroupByModule()
    this.getOrgUsersRoleList();
  }

  get f() { return this.orgUserRoleForm.controls; }

  getOrgUsersRoleList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getRoles}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}`, '').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.orgUserRoleList = val?.data;
        this.loading = false;
      }
    });
  }

  changeOrganization() {
    this.getOrgUsersRoleList();
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getOrgUsersRoleList();
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

  clickCheckbox() {
    if (!this.permissionObj?.edit)
      this.alertService.error(`You are not authorised to do this. `);
  }

  openAddEditRoleModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    // this.orgList = await this.getOrganizationList();
    this.orgUserRoleForm = this.fb.group({
      roleType: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      description: [''],
      activeStatus: ['1', [Validators.required]]
    })
    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-xl', backdrop: 'static' });
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      // this.orgUserRoleForm.controls['orgId'].disable();
      setTimeout(() => {
        this.orgUserRoleForm.patchValue({
          roleType: obj.role_type,
          description: obj.description,
          activeStatus: obj.active_status.toString()
        });
      }, 250);
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);

  }

  openViewUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-md view-modal', backdrop: 'static' });
    this.viewObj = obj
  }

  openEditUserRoleModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef?.hide();
    setTimeout(() => {
      this.openAddEditRoleModal(template, obj);
    }, 200);
  }



  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.orgUserRoleForm.valid) {
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.updateRoles}/${this.editObj.user_role_id}`, this.orgUserRoleForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgUsersRoleList();
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
        let payoad = {
          ... this.orgUserRoleForm.value,
          selectedRolePermissionData: [...this.selectedRolePermissionData]
        }
        this.apiSvc.post(AppConfig.apiUrl.orgAdmin.createRoles, payoad).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.modalRef?.hide();
              this.getOrgUsersRoleList();
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
      this.formValidationSvc.validateAllFormFields(this.orgUserRoleForm);
    }

  }

  deleteUserRole(obj: any) {
    this.confrmSvc.confirm('Are you sure', `Do you really want to delete ${obj.role_type} role ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.delete(`${AppConfig.apiUrl.orgAdmin.deleteRoles}/${obj.user_role_id}`).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getOrgUsersRoleList();
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
      this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.role_type} Role ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.toggleRoleStatus}/${obj.user_role_id}`, { 'activeStatus': obj.active_status == 1 ? '0' : '1' }).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.alertService.success(response.message);
                this.loading = false;
              } else {
                this.alertService.error(response.message);
              }
            },
            error: () => {
            },
            complete: () => {
              this.getOrgUsersRoleList()
            }
          });
        } else {
          obj.active_status = previousActiveStatus;
          this.cdRef.detectChanges();
        }
      }).catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });

    } else {
      this.alertService.error(`You are not authorised to do this. `);
    }
  }
  closeAddEditRoleModal() {
    this.orgUserRoleForm.reset()
    this.submitted = false;
    this.modalRef?.hide();
    this.loading = false;
    this.editObj = {};
    this.isOpenPermissionModal = false;
  }
  async openRolePermissionModal(template: TemplateRef<any>, obj: any) {
    this.isOpenPermissionModal = true
    this.roleModuleSubmodulePermissionRef = this.mdlSvc.show(template, { class: 'modal-xl', backdrop: 'static' });
    this.selectedRoleObj = obj
    setTimeout(() => {
      obj.role_permission_details.forEach((element: any) => {

        element.submodules.forEach((submodule: any) => {
          const checkboxes: any = Array.from(document.querySelectorAll(`.permissionCheckBox${submodule.org_sub_module_id}`));
          const values = submodule.permission_details.combination.split(',');
          checkboxes.forEach((checkbox: any, index: number) => {
            checkbox.value = values[index]
            if (checkbox.value == 1) {
              checkbox.checked = true;
            } else {
              checkbox.checked = false;
            }
          });
          this.changePermission(element.module_details.org_module_id, submodule);



        });

      });
    }, 100);


  }
  getAllModuleSubModulelistGroupByModule() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getAllSubModuleGroupByModule}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subModulesgroupByModuleList = response.data
           // Sort modules array by sequence
           this.subModulesgroupByModuleList.sort((a: any, b: any) => a.module_sequence - b.module_sequence);
          this.subModulesgroupByModuleList.forEach((element: any) => {
            if (element.sub_modules) {
              // Sort submodules array within each module_details this.subModulesgroupByModuleListect by sequence
               element.sub_modules.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0));
             }
            element.selected = false
            element.sub_modules.forEach((el: any) => {
              el.selected = false;
            });
          });
        }
      }, error: (response: any) => { }, complete: () => { }
    })
  }
  closeRolesPermissionModal() {
    this.roleModuleSubmodulePermissionRef?.hide();
    this.selectedRolePermissionData = [];
    this.isOpenPermissionModal = false;
    this.selectedRoleObj = {}
  }



  saveRoleModuleSubModulePermission() {
    if (this.permissionObj?.edit) {

      let payload = [...this.selectedRolePermissionData]
      this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.setRolePermission}/${this.selectedRoleObj.user_role_id}`, { selectedRolePermissionData: payload }).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.closeRolesPermissionModal();
            this.alertService.success(response.message);
          } else {
            this.alertService.error(response.message);
          }
        },
        error: (err) => {

        }, complete: () => { this.loading = false, this.getOrgUsersRoleList(); }
      })
    } else {
      this.alertService.error(`You are not authorised to do this. `);
    }
  }

  changePermission(module_id: any, obj: any) {
    const permissionAllCheckBox: any = document.getElementById(`permissionAllCheckBox${module_id}`)
    const checkboxes: any = Array.from(document.querySelectorAll(`.permissionCheckBox${obj?.org_sub_module_id}`));
    const viewCheckbox: any = document.getElementById(`viewPermissionCheckBox${obj?.org_sub_module_id}`);
    // Initialize an array to store checkbox values
    const values: string[] = [];
    // Loop through the checkboxes and push 1 if checked, 0 if unchecked
    checkboxes.forEach((checkbox: any) => {
      checkbox.value = checkbox.checked ? '1' : '0'
      values.push(checkbox.checked ? '1' : '0');
    });
    // If any of the "edit," "create," or "delete" checkboxes are checked,
    // check the "view" checkbox and disable it
    if (values.slice(1).some(value => value === '1')) {
      values[0] = '1'
      viewCheckbox.checked = true;
      viewCheckbox.disabled = true;
    } else {
      //values[0]='0'
      viewCheckbox.disabled = false;
    }
    // Join the values into a string with commas
    const result = values.join(',');
    this.selectedRolePermissionData.push({
      user_role_id: this.selectedRoleObj? this.selectedRoleObj.user_role_id:null,
      org_module_id: module_id,
      org_sub_module_id: obj.org_sub_module_id,
      combination: result
    })
    this.selectedRolePermissionData = _.uniqBy(this.selectedRolePermissionData, 'org_sub_module_id')
    let arr = _.find(this.selectedRolePermissionData, { 'org_sub_module_id': obj.org_sub_module_id });
    if (arr) {
      arr.combination = result
    }
    const filteredData = this.selectedRolePermissionData.filter((item: any) => item.combination !== "0,0,0,0");
    this.selectedRolePermissionData = filteredData

    let filterdModule = _.find(this.subModulesgroupByModuleList, { 'module_id': module_id });
    let allSubModulecheckbox = [] as any
    filterdModule.sub_modules.forEach((el: any, i: number) => {
      allSubModulecheckbox.push(...Array.from(document.querySelectorAll(`.permissionCheckBox${el?.org_sub_module_id}`)))
    });
    const allPermissionSelected = allSubModulecheckbox.every((checkbox: any) => checkbox.checked);
    permissionAllCheckBox.checked = allPermissionSelected;

  }
  checkAllPermission(ev: any, module_id: any, subModules: any) {
    subModules.forEach((element: any) => {
      const checkboxes = document.querySelectorAll(`.permissionCheckBox${element?.org_sub_module_id}`);
      // Initialize an array to store checkbox values
      // Loop through the checkboxes and push 1 if checked, 0 if unchecked
      checkboxes.forEach((checkbox: any) => {
        checkbox.checked = ev.target.checked ? true : false
      });
      setTimeout(() => {
        this.changePermission(module_id, element)
      }, 500);
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
    this.getOrgUsersRoleList();
  }
  searchRoleType(e: any) {
    if (e.target.value.length >= 3) {
      this.searchingvalue = e.target.value;
      setTimeout(() => {
        this.getOrgUsersRoleList()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getOrgUsersRoleList()
    }
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/role-management');
    this.getOrgUsersRoleList();
  }
  resetAllFilter(){
    this.searchingvalue='';
    this.getOrgUsersRoleList()
  }
}
