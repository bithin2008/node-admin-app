import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, Subscription } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { saveAs } from 'file-saver';
import { FileDownloadService } from 'src/app/@core/services/file-download.service';
import { HttpClient } from '@angular/common/http';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-career-list',
  templateUrl: './career-list.component.html',
  styleUrls: ['./career-list.component.scss']
})
export class CareerListComponent {
  viewCareerModalRef?: BsModalRef | null;
  careersList = [] as any;
  primaySearch: any = ''
  customerForm: any;
  viewCareerObj: any
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  planTermList: any
  planList: any
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  permissionObj = {} as any
  filterObj: any = {};
  fileUrl: any;
  blob: any;
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
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  sortField: string = 'career_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  resetSearchInput = false;
  filterPolicyStatus: any = ''
  filterPlanName: any = ''
  filterPlanTerm: any = ''

  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private fileDownloadService: FileDownloadService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private http: HttpClient
  ) {
    this.commonSvc.setTitle('Policy Management');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    // this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj: any) => {
    //   if (permissionObj) {
    //     this.permissionObj = permissionObj
    //     // Do something with the permission object
    //   } else {
    //     // Handle the case where no permission is found
    //   }
    // });
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }


  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/career-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getCareerList();
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(
            `${AppConfig.apiUrl.careers.getAllCareer}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`, ''
          );
        })
      )
      .subscribe((response: any) => {
        this.paginationObj = response?.pagination;
        this.careersList = response?.data;
      });

    this.getCareerList();
  }
  get f() { return this.customerForm.controls; }

  ngAfterViewInit() {
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }

  async downloadResume(obj: any) {
    // if (obj.resume_doc) {
    //   this.fileUrl = await fetch(obj.resume_url);
    //   this.blob = await this.fileUrl.blob();
    //   saveAs(this.blob, obj.resume_doc);
    // } else {
    //   this.alertService.error('Sorry! File not available');
    //   return;
    // }

    if (obj.resume_doc) {
    // this.fileDownloadService.downloadFile(obj.resume_url).subscribe((data: Blob) => {
    //   const blob = new Blob([data], { type: 'application/octet-stream' });
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = obj.resume_doc; // Specify the desired filename here.
    //   document.body.appendChild(a);
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    // });


    window.open(obj.resume_url, '_blank');
  } else {
    this.alertService.error('Sorry! File not available');
    return;
  }
  }

  getCareerList() {
    let url = `${AppConfig.apiUrl.careers.getAllCareer}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}`
    if (this.filterObj.firstName) {
      url = url + `&firstName=${this.filterObj.firstName}`;
    }
    if (this.filterObj.lastName) {
      url = url + `&lastName=${this.filterObj.lastName}`;
    }
    if (this.filterObj.email) {
      url = url + `&email=${this.filterObj.email}`;
    }
    if (this.filterObj.mobile) {
      url = url + `&mobile=${this.filterObj.mobile}`;
    }
    if (this.filterObj.companyName) {
      url = url + `&companyName=${this.filterObj.companyName}`;
    }
    this.apiSvc.post(url, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.paginationObj = response?.pagination;
          this.careersList = response?.data;
        } else {
          this.alertService.error(response.message)
        }

      }
    });
  }

  advancedFilter(fieldName: string) {
    if (this.filterObj[fieldName].length >= 3) {
      this.getCareerList();
    }
    if (this.filterObj[fieldName].length == 0) {
      this.getCareerList();
    }
  }


  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/career-management');
    this.getCareerList();
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
    this.getCareerList();
  }



  search(e: any) {
    this.searchingvalue = '';
    const inputValue = e.target.value;

    if (inputValue.length >= 3) {
      this.searchSubject.next(inputValue);
    } else {
      this.searchSubject.next('');
    }

    if (e.target.value.length == 0) {
      this.getCareerList();
    }
  }

  openViewCareerModal(template: TemplateRef<any>, obj: any) {
    this.viewCareerModalRef = this.mdlSvc.show(template, {  backdrop: 'static',class:'modal-md' });
    this.viewCareerObj = obj
  }

  resetAllFilter() {
    this.searchingvalue = '';
    this.primaySearch = '';
    this.filterObj = {};
    this.searchSubject.next('');
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);
    this.getCareerList();
  }
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
