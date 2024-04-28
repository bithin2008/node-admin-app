import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { of, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CommonService } from 'src/app/@core/services/common.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { SystemAdminApiService } from 'src/app/@core/services/system-admin-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  public saveUserForm!: UntypedFormGroup;
  public submitted!: boolean;
  public events: any[] = [];
  public systemAdminList: any;
  public postData = {};
  subscription !: Subscription;
  loading: boolean = true;

  // Pagination Config
  currentPageIndex: number = 0;
  first: number = 1;
  totalRecords: number = 0;
  itemPerPage: number = 10;
  itemPerPageDropdown = [10, 20, 30, 50, 100, 150, 200];

  paginationObj={
    // The number of elements in the page
    limit:20,
    // The total number of elements
    total:10,
    // The total number of pages
    totalPages:3,
    // The current page number
    currentPage:1,
  };
  ColumnMode = ColumnMode;

  searchKeyword: any = '';
  paginate(event: any) {
    this.first = event.page + 1;
    this.getSystemAdminList();
  }
  constructor(
    private apiSvc: SystemAdminApiService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.commonSvc.setTitle('Dashboard');
  }
  ngOnInit(): void {
    this.setPage({ offset: 0 });
    this.getSystemAdminList()
  }

  getSystemAdminList() {
    this.showTableDataLoading = true;
    this.apiSvc.get(`${AppConfig.apiUrl.systemAdmin.getSystemAdmin}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}`).subscribe({
      next: (val: any) => {
        this.paginationObj= val?.pagination
        this.totalRecords = val?.pagination?.total;
        this.systemAdminList = val?.data;
        this.loading = false;
      },error: () => {}, complete: () => {this.showTableDataLoading=false}
    });
  }

  getSearchKeyword(str: string) {
    this.searchKeyword = str;
    this.resetPagination();
    this.getSystemAdminList();
  }

  resetPagination() {
    this.currentPageIndex = 0;
    this.totalRecords = 0;
    this.itemPerPage = 10;
    this.first = 1;
  }
 
  public columns = [{ prop: 'name' }, {name: 'Email'},{ name: 'Mobile' }, ];
  showTableDataLoading = false;
 
  reorderable = true;
  selected = []as any;

  SelectionType = SelectionType;
  editing = {}as any;
  temp = []as any;
  @ViewChild(DatatableComponent) table!: DatatableComponent;


  setPage(pageInfo: { offset: number; }) {
    this.paginationObj.currentPage = pageInfo.offset;
    // this.serverResultsService.getResults(this.page).subscribe(pagedData => {
    //   this.page = pagedData.page;
    //   this.rows = pagedData.data;
    // });
  }
  updateValue(event:any, cell:any, rowIndex:any) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.systemAdminList[rowIndex][cell] = event.target.value;
    this.systemAdminList = [...this.systemAdminList];
    console.log('UPDATED!', this.systemAdminList[rowIndex][cell]);
  }
  toggleExpandRow(row:any) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }
  action(obj:any){
    console.log(obj);
    
  }
  updateFilter(event:any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d:any) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.systemAdminList = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
  onSelect({ selected }:any) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  
  displayCheck(row:any) {
    return row.name !== 'Ethel Price';
  }
 
  onDetailToggle(event:any) {
      
  }
}

