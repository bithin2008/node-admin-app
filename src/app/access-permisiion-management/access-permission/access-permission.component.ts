import { Component, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-access-permission',
  templateUrl: './access-permission.component.html',
  styleUrls: ['./access-permission.component.scss']
})
export class AccessPermissionComponent {
  accessPermissionModalRef?: BsModalRef | null;
  public orgUsersList: any = [];
  public subModulesgroupByModuleList: any = [];
  public selectedAccessPermissionData: any = [];
  selectedOrgUser: any
  sortField: string = 'org_user_id'; // Default sorting field
  sortOrder: string = 'desc'; // Default sorting order
  searchingvalue: any = '';
  resetSearchInput = false;
  loading = false
  filterByDeptId = '0'
  filterByRoleId = '0'
  orgDepartmentList: any
  orgRoleList: any
  permissionObj: any
  // Pagination Config
  paginationObj = {
    first: 0,
    // The number of elements in the page
    limit: 10,
    // The total number of elements
    total: 10,
    // The total number of pages
    totalPages: 3,
    // The current page number
    currentPage: 1,
  };
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200, 300];
  advanceFilter: any
  advancedSearchConfig: any = {
    inputConfig: [
      {isDisplay:true , propertyName:'filterDept', value:'', placeholder:'Select',label:'Department Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},
      {isDisplay:true , propertyName:'filterrole', value:'', placeholder:'Select',label:'Role Name', className:'form-control',type:'dropdown',inputType:'dropdown',data:[]},

    ]

  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
    this.advanceFilter = event.searchQuery
    // console.log(this.advanceFilter);
    this.getOrgUserList();
  }
  constructor(
    private apiSvc: ApiService,
    private commonSvc: CommonService,
    private mdlSvc: BsModalService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private shrdSvc: SharedService,
    private formValidationSvc:FormValidationService

  ) {
    // this.activatedRoute.data.subscribe((data: any) => {
    //   const subModuleDetails = data['subModuleDetails'];
    //   if (subModuleDetails) {
    //     this.shrdSvc.updateSubmoduleDetails(subModuleDetails);
    //     let combArr = subModuleDetails.permission_details.combination.split(',');
    //     this.permissionObj = {
    //       view: combArr[0] === '1',
    //       add: combArr[1] === '1',
    //       edit: combArr[2] === '1',
    //       delete: combArr[3] === '1'
    //     };
    //   }
    // });
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }

  ngOnInit() {
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
    //     // Use the resolved data in your component
    //     this.shrdSvc.updateSubmoduleDetails(subModuleDetails);
    //   } else {
    //     // Handle the case where no data was resolved (e.g., show an error message)
    //   }
    //   // Now you can work with the resolved data
    // });
    this.getOrgUserList();
    this.getOrgRoleList();
    this.getOrgDepartmentList()
    this.getAllModuleSubModulelistGroupByModule()
  }
  getOrgUserList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsers}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&search=${this.searchingvalue}${this.advanceFilter?this.advanceFilter:''}`, '').subscribe({
      next: (val: any) => {
        this.paginationObj = val?.pagination;
        this.orgUsersList = val?.data;
      }
    });
  }
  getOrgRoleList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getRoles}?active_status=1&sortField=role_type&sortOrder=ASC`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orgRoleList = response?.data
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='filterrole') {
              this.orgRoleList.forEach((el:any) => {
                element.data.push({key:el.role_type,value:el.user_role_id})
              });
            }
          });
        }
      },
      error: (e) => { },
    });
  }

  getOrgDepartmentList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgDepartments}?active_status=1&sortField=department_name&sortOrder=ASC`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orgDepartmentList = response?.data;
          this.advancedSearchConfig.inputConfig.forEach((element:any) => {
            if (element.propertyName=='filterDept') {
              this.orgDepartmentList.forEach((el:any) => {
                element.data.push({key:el.department_name,value:el.department_id})
              });
            }
          });
        } else {
        }
      },
      error: () => {
      },
    });
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
  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/access-permission-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getOrgUserList();
  }
  ngAfterViewInit() {
    this.formValidationSvc.forms();
  }
  searchUser(e: any) {
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
        this.getOrgUserList()
      }, 500);
    } else {
      this.searchingvalue = ''
    }
    if (e.target.value.length == 0) {
      this.getOrgUserList()
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
    this.getOrgUserList();
  }
  openManageAccessPermissionModal(template: TemplateRef<any>, obj: any) {
    this.accessPermissionModalRef = this.mdlSvc.show(template, { class: 'modal-xl', backdrop: 'static' });
    this.selectedOrgUser = obj;
    setTimeout(() => {
      obj.accessable_module_submodules.forEach((element: any) => {
        element.submodules.forEach((submodule: any) => {
          const checkboxes: any = Array.from(document.querySelectorAll(`.permissionCheckBox${submodule.org_sub_module_id}`));
          // console.log(submodule.permission_details);          
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
  closeAccessPermissionModal() {
    this.accessPermissionModalRef?.hide();
    this.selectedAccessPermissionData = [];
    this.selectedOrgUser = null;
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
    this.selectedAccessPermissionData.push({
      org_module_id: module_id,
      org_sub_module_id: obj.org_sub_module_id,
      combination: result
    })
    this.selectedAccessPermissionData = _.uniqBy(this.selectedAccessPermissionData, 'org_sub_module_id')
    let arr = _.find(this.selectedAccessPermissionData, { 'org_sub_module_id': obj.org_sub_module_id });
    if (arr) {
      arr.combination = result
    }
    const filteredData = this.selectedAccessPermissionData.filter((item: any) => item.combination !== "0,0,0,0");
    this.selectedAccessPermissionData = filteredData

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
  saveUserModuleSubModuleAccessPermission() {
    if (this.permissionObj?.add || this.permissionObj?.edit) {


      this.loading = true;
      let payload = [...this.selectedAccessPermissionData]
      this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.setOrgUserAccessPermission}/${this.selectedOrgUser.org_user_id}`, { selectedAccessPermissionData: payload }).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.closeAccessPermissionModal();
            this.alertService.success(response.message);
          } else {
            this.alertService.error(response.message);
          }
        },
        error: (err) => {

        }, complete: () => { this.loading = false, this.getOrgUserList(); }
      })
    } else {
      this.alertService.error(`You are not authorised to do this. `);
    }
  }
  resetAllFilter(){
    this.searchingvalue='';
    this.filterByDeptId='0'
    this.filterByRoleId ='0'
    this.getOrgUserList()
    this.formValidationSvc.forms()
  }
  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/access-permission-management');
    this.getOrgUserList();
  }
}
