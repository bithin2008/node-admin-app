import { ChangeDetectorRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import * as _ from 'lodash';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {
  customerList = [] as any;
  customerForm: any;
  loading: boolean = false;
  isEdit: boolean = false;
  validZipMessage = '';
  validZip: boolean = false;
  editObj: any = {};
  modalRef?: BsModalRef | null;
  advanceFilter: any
  public submitted!: boolean;
  permissionObj = {} as any
  resetSearchInput = false;

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
  sortField: string = 'customer_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  advancedSearchConfig: any = {
    inputConfig: [
      { isDisplay: true, propertyName: 'full_name', value: null, placeholder: 'Search', label: 'Name', max: "50", className: 'form-control', type: 'textBox', inputType: 'text', },
      { isDisplay: true, propertyName: 'email', value: null, placeholder: 'Search', label: 'Email', max: "50", className: 'form-control', type: 'textBox', inputType: 'text', },
      { isDisplay: true, propertyName: 'mobile', value: null, placeholder: 'Search', max: "13", label: 'Mobile', className: 'form-control', type: 'textBox', inputType: 'mobile' },
      { isDisplay: true, propertyName: 'zip', value: null, placeholder: 'Search', label: 'Zip', max: "5", className: 'form-control', type: 'textBox', inputType: 'number', },
      { isDisplay: true, propertyName: 'state', value: null, placeholder: 'Search', label: 'State', max: "100", className: 'form-control', type: 'textBox', inputType: 'text', },
      { isDisplay: true, propertyName: 'city', value: null, placeholder: 'Search', label: 'City', max: "100", className: 'form-control', type: 'textBox', inputType: 'text', },
      { isDisplay: true, propertyName: 'address1', value: null, placeholder: 'Search', label: 'Address', max: "250", className: 'form-control', type: 'textBox', inputType: 'text', },
      { isDisplay: true, propertyName: 'created_at', value:null, placeholder: 'Search', label: 'Created On', className: 'form-control', type: 'dateRangePicker', inputType: 'dateRangePicker',  maxDate: new Date() },

    ]

  }
  advancedSearchInputValueChange(event: { searchQuery: string; advancedSearchConfig: any }) {
    // Handle the emitted input value here
    this.advanceFilter = event.searchQuery
     console.log(this.advanceFilter);
    this.getCustomerList();
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
    private cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
  ) {
    this.commonSvc.setTitle('Customers Management');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    /* this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj: any) => {
      if (permissionObj) {
        this.permissionObj = permissionObj
        // Do something with the permission object
      } else {
        // Handle the case where no permission is found
      }
    }); */
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

 
  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/customer-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getCustomerList();

  }
  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getAllCustomers}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}${this.advanceFilter ? this.advanceFilter : ''}`, '')
        })
      )
      .subscribe({
        next: (response: any) => {
          this.paginationObj = response?.pagination;
          this.customerList = response?.data;
        }
      });
    //this.getCustomerList()
    this.formValidationSvc.forms();

  }
  get f() { return this.customerForm.controls; }

  getCustomerList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getAllCustomers}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}${this.advanceFilter ? this.advanceFilter : ''}`, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.customerList = response?.data;
      }
    });
  }
  exportCustomerList(export_key: string) {
    this.apiSvc.downloadFile(`${AppConfig.apiUrl.orgAdmin.getAllCustomers}/${export_key}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue ? `&search=${this.searchingvalue}` : ''}${this.advanceFilter ? this.advanceFilter : ''}`, '').subscribe({
      next: (response: any) => {

        let fileName = response.headers.get('content-disposition')?.split(';')[1].split('=')[1];
        // Create a blob from the response
        let blob = new Blob([response.body], { type: response.type });

        // Create a URL for the blob
        let blobUrl = window.URL.createObjectURL(blob);

        // Create a download link
        let a = document.createElement('a');
        a.download = fileName;
        a.href = blobUrl;
        a.click();
        this.alertService.success(response.message)
      }
    });

  }


  changeActivationStatus(ev: any, obj: any) {
    if (this.permissionObj?.edit) {
      ev.preventDefault();
      const previousActiveStatus = obj.active_status;
      this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.first_name}  ${obj.last_name} ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.toggoleCustomerStatus}/${obj?.customer_id}`, { 'active_status': obj.active_status == 1 ? '0' : '1' }).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.alertService.success(response.message);
              } else {
                this.alertService.error(response.message);
              }
            }, error: () => { }, complete: () => { this.getCustomerList() }
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
    this.getCustomerList();
  }

  async changeZip(e: any) {
    if (e.target.value.toString().length > 4) {
      let response: any = await this.commonSvc.validateZipCode(e.target.value);
      if (response.status == 1) {
        this.alertService.success(response.message);
        this.customerForm.controls['state'].setValue(response.data.state);
        this.customerForm.controls['city'].setValue(response.data.city);
        this.validZip = true;
        this.validZipMessage = '';
      } else {
        this.validZipMessage = 'Unavailable services in this zip code';
      }

    }
  }
  navigateToCustomerDetails(customer_id: any) {

    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }

  searchCustomer() {
    const inputValue = this.searchingvalue;
    // Define the minimum length required for calling the function
    const minLengthForCall = 3;
    // Check if the input value starts with a date pattern (e.g., "MM-DD-YYYY")
    const startsWithDatePattern = /^\d{2}-/.test(inputValue);
    // Determine the minimum length based on whether it starts with a date pattern
    const minLength = startsWithDatePattern ? 10 : minLengthForCall;

    if (inputValue.length >= minLength) {
      this.searchSubject.next(inputValue);
    } else {
      this.searchSubject.next('');
    }

    if (this.searchingvalue.length == 0) {
      this.getCustomerList();
    }
  }
  openAddEditCustomerModal(template: TemplateRef<any>, obj: any) {
    this.isEdit = false;
    this.customerForm = this.fb.group({
      first_name: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      last_name: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      email: ['', [Validators.required, this.formValidationSvc.validEmail]],
      mobile: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      alternate_phone: [''],
      zip: ['', [Validators.required, Validators.minLength(5), this.formValidationSvc.numericOnly]],
      city: ['', [Validators.required]],
      state: ['', Validators.required],
      address1: ['', [Validators.required]],
      address2: [''],
      active_status: ['1', [Validators.required]]
    })
    this.modalRef = this.mdlSvc.show(template, { class: 'modal-md', backdrop: 'static' });
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      // console.log(obj);

      this.validZip=true;
      this.customerForm.patchValue({
        first_name: obj.first_name,
        last_name: obj.last_name,
        email: obj.email,
        mobile: this.commonSvc.setUSFormatPhoneNumber(obj.mobile),
        alternate_phone: this.commonSvc.setUSFormatPhoneNumber(obj.alternate_phone),
        zip: obj.zip,
        city: obj.city,
        state: obj.state,
        address1: obj.address1,
        address2: obj.address2,
        active_status: obj.active_status.toString()
      });
      this.formValidationSvc.forms();
    }

    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 400);
  };

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.customerForm.valid && this.validZip) {
      this.customerForm.value.mobile = this.commonSvc.convertToNormalPhoneNumber(this.customerForm.value.mobile)
      this.customerForm.value.alternate_phone = this.commonSvc.convertToNormalPhoneNumber(this.customerForm.value.alternate_phone)
      if (this.isEdit) {
        this.apiSvc.put(`${AppConfig.apiUrl.orgAdmin.updateCustomer}/${this.editObj.customer_id}`, this.customerForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.closeAddEditCustomerModal()
              this.getCustomerList();
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
          },
          complete: () => {
            this.loading = false;
          }
        });
      };
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.customerForm);
    }
  }
  changePhoneFormat(e: any) {
    this.customerForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  }

  changeResidancePhoneFormat(e: any) {
    this.customerForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(e.target.value.toString()));
  };

  closeAddEditCustomerModal() {
    this.modalRef?.hide();
    this.submitted = false;
    this.customerForm.reset();
    this.isEdit = false;
    this.editObj = false;
  }
  changeDate(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }


  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/customer-management');
    this.getCustomerList();
  }
 
}


