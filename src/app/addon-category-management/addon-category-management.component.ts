import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';


import { AlertService } from 'src/app/@core/services/alert.service';
import { of, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ApiService } from '../@core/services/api.service';
import { CommonService } from '../@core/services/common.service';


@Component({
  selector: 'app-addon-category-management',
  templateUrl: './addon-category-management.component.html',
  styleUrls: ['./addon-category-management.component.scss']
})
export class AddonCategoryManagementComponent {

  public saveUserForm!: UntypedFormGroup;
  public submitted!: boolean;
  public events: any[] = [];
  public addonCategoryList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;
  showTableDataLoading = false;

  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 1;
  totalRecords: number = 0;
  addonCategoryPerPage: number = 10;
  addonCategoryPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];
  searchKeyword: any = '';
  paginate(event: any) {
    this.first = event.page + 1;
    this.getaddonCategoriesList();
  }
  // Pagination Config

  constructor(
    private apiSvc: ApiService,
    private alertSvc: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.commonSvc.setTitle('User Management');
  }

  ngOnInit() {
    this.getaddonCategoriesList();
  }

  getaddonCategoriesList() {
    this.showTableDataLoading = true;
    this.apiSvc.get(`${AppConfig.apiUrl.getAddonCategory}?page=${this.first}&limit=${this.addonCategoryPerPage}`).subscribe({
      next: (val: any) => {
        this.totalRecords = val?.pagination?.total;
        this.addonCategoryList = val?.data;
        this.loading = false;
        this.showTableDataLoading = false;
      }
    });
  }



  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getaddonCategoriesList();
  }

  resetPagination() {
    this.currentPageIndex = 0;
    this.totalRecords = 0;
    this.addonCategoryPerPage = 10;
    this.first = 1;
  }

  deleteUser(obj: any) {
    this.apiSvc.delete(`${AppConfig.apiUrl.deleteUser}/${obj.addonCategory_id}`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertSvc.success(response.message);
          this.getaddonCategoriesList();
        }

      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
}
