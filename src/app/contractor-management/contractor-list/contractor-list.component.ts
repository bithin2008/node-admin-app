import { ChangeDetectorRef, Component, NgZone, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, debounceTime, distinctUntilChanged, switchMap , of, Subscription } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { saveAs } from 'file-saver';
import { checkAccessPermission } from 'src/app/@core/global';

@Component({
  selector: 'app-contractor-list',
  templateUrl: './contractor-list.component.html',
  styleUrls: ['./contractor-list.component.scss']
})
export class ContractorListComponent {
  viewContractorsModalRef?: BsModalRef | null;

  contractorsList = [] as any;
  primaySearch:any=''
  //customerForm: any;
  viewContractorsObj:any
  loading: boolean = false;
  isEdit: boolean = false;
  editObj: any = {};
  planTermList:any
  planList:any
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  permissionObj={}as any
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
  itemPerPageDropdown = [5,10, 20, 30, 50, 100, 150, 200];
  sortField: string = 'contractor_id'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  searchingvalue: any = ''
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  uploadedLicense: any = null;
  filterPolicyStatus:any=''
  filterPlanName:any=''
  filterPlanTerm:any=''
  resetSearchInput = false;
  contractorForm: any;
  zipCodeList: any = [];
  serviceCity: any=[];
  productList: any=[];
  contractor_id: any;
  validContractorCustomer: boolean=false;
  validZipContractorMessage: string='';

  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private commonSvc: CommonService,
    private formValidationService: FormValidationService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private cdRef: ChangeDetectorRef,
    private activatedRoute:ActivatedRoute,
    private sharedService:SharedService,
    private zone: NgZone
  ) {
    this.commonSvc.setTitle('Manage Contractors');      
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
    

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if(this.paginationObj.limit!==event.rows){
      this.paginationObj.limit=event.rows
    }
    this.router.navigate(['/contractor-management'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getContractorsList();
  }
  
  ngOnInit() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValue: string) => {
          this.searchingvalue = searchValue;
          return this.apiSvc.post(
            `${AppConfig.apiUrl.contractors.getAllContractors}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}`, ''
          );
        })
      )
      .subscribe((response: any) => {
        this.paginationObj = response?.pagination;
        this.contractorsList = response?.data;
      });

    this.getContractorsList();
    this.getProductsList()
  }
  get f() { return this.contractorForm.controls; }

  changePhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'companyPhone') {
        this.contractorForm.controls['companyPhone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        // this.createPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['mobile_customer'].value));
      } else if (field_name == 'mobileNo') {
        this.contractorForm.controls['mobileNo'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      }
    }

    this.formValidationSvc.forms()
  }

 

  searchZipCode(ev: any) {
    if (ev.target.value.length > 2) {
      this.apiSvc.post(AppConfig.apiUrl.common.searchZipcode, { zipcode: ev.target.value.toString() }).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.zone.run(() => {
              this.zipCodeList = response.data;
            });
          }
        }
      });
    } else {
      this.zipCodeList = [];
    }
  }

  selectZipCode(ev: any) {
    this.serviceCity.push(ev.zipcode);
    this.contractorForm.patchValue({
      serviceCity:this.serviceCity
    })
    console.log(this.serviceCity,this.contractorForm.value.serviceCity);
    
  }


  ngAfterViewInit() {
      // const realFileBtn: any = document.getElementById("real-file");
      // const customBtn: any = document.getElementById("file-upload-btn");
      // const customTxt: any = document.getElementById("custom-text");
      // customBtn.addEventListener("click", function () {
      //   realFileBtn.click();
      // });
      // realFileBtn.addEventListener("change", function () {
      //   if (realFileBtn.value) {
      //     customTxt.innerHTML = realFileBtn.value.match(
      //       /[\/\\]([\w\d\s\.\-\(\)]+)$/
      //     )[1];
      //     customTxt.style.display = 'block';
      //   }
      //   else {
      //     customTxt.innerHTML = "No file chosen, yet.";
      //   }
      // });
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);

  }
  
  async downloadLicense(obj:any) {
    if(obj.license_doc){
      this.fileUrl = await fetch(obj.license_url);
      this.blob = await this.fileUrl.blob();
      saveAs(this.blob, obj.license_doc);
    }else{
      this.alertService.error('Sorry! File not available');
      return;
    }
  }

  getContractorsList() {
    let url = `${AppConfig.apiUrl.contractors.getAllContractors}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}${this.searchingvalue?`&search=${this.searchingvalue}`:''}`
    if(this.filterObj.firstName){
      url= url+ `&firstName=${this.filterObj.firstName}`;
    }
    if(this.filterObj.lastName){
      url= url+ `&lastName=${this.filterObj.lastName}`;
    }
    if(this.filterObj.email){
      url= url+ `&email=${this.filterObj.email}`;
    }
    if(this.filterObj.mobile){
      url= url+ `&mobile=${this.filterObj.mobile}`;
    }
    if(this.filterObj.companyName){
      url= url+ `&companyName=${this.filterObj.companyName}`;
    }
    if(this.filterObj.zip){
      url= url+ `&zip=${this.filterObj.zip}`;
    }
    if(this.filterObj.state){
      url= url+ `&state=${this.filterObj.state}`;
    }
    if(this.filterObj.city){
      url= url+ `&city=${this.filterObj.city}`;
    }
    if(this.filterObj.service_location){
      url= url+ `&service_location=${this.filterObj.serviceLocation}`;
    }
    this.apiSvc.post(url, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.contractorsList = response?.data;
      }
    });
  }

  async downloadDoc(obj: any) {
    if (obj.license_url) {
    window.open(obj.license_url, '_blank');
  } else {
    this.alertService.error('Sorry! File not available');
    return;
  }
  }

  fileChangeEvent(event: any): void {
    const fileSize = event.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 6) {
      this.alertService.warning('File size exceeds 6MB',);
      this.contractorForm.patchValue({
        licenseFile: null
      })
      var el: any = document.getElementById('formFile');
      el.value = '';
      return
    }
    let validation: any = this.commonSvc.validateFileUpload(event.target.files[0].name, ['docx', 'doc', 'pdf']);
    if (validation) {
      this.uploadedLicense = event.target.files[0];
      this.contractorForm.patchValue({
        licenseFile: event.target.files[0]?event.target.files[0].name:null
      })
    } else {
      this.alertService.warning('Only docs, pdf formats are supported');
      this.contractorForm.patchValue({
        licenseFile: null
      })
      return
    }
  }


  advancedFilter(fieldName:string){
    if(this.filterObj[fieldName].length>= 3){
      this.getContractorsList();
    }
    if(this.filterObj[fieldName].length== 0){
      this.getContractorsList();
    }
  }

  updateSorting(columnName: string) {
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    this.getContractorsList();
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/contractor-management');
    this.getContractorsList();
  }


  openViewAffiliateModal(template: TemplateRef<any>, obj: any) {
    this.viewContractorsModalRef = this.mdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });
    this.viewContractorsObj = obj
  }

  resetAllFilter(){
    this.searchingvalue = '';
    this.primaySearch='';
    this.filterObj={};
    this.searchSubject.next('');
    this.getContractorsList();
  }
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSubmit(){
   if (this.contractorForm.valid) {
      this.loading = true;
      let data={...this.contractorForm.value,contractor_id:this.contractor_id};
      this.apiSvc.post(AppConfig.apiUrl.contractors.updateContractor, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) { 
            if (this.uploadedLicense) {
              this.updateLicense(response.message)
            } else{
              this.alertService.success(response.message);  
              this.getContractorsList();
            }  
            this.modalRef?.hide();
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
    }else{
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.contractorForm);
    }
  }

  closeAddEditModal(){
    this.submitted = false;
    this.contractorForm.reset();
    this.modalRef?.hide();
    this.loading = false;
    this.isEdit = false;
  }

  openEditModal(template: TemplateRef<any>, obj: any) {
    this.modalRef?.hide();
    setTimeout(() => {
      this.openAddEditModal(template, obj);
    }, 200);
  }


  getServicableCity(obj:any){
    try {
      let servicableZip = JSON.parse(obj.service_location);
      return servicableZip.length > 0 ? servicableZip : [];
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  }
  async openAddEditModal(template: TemplateRef<any>, obj: any) {
   this.contractor_id=obj.contractor_id;
   this.serviceCity = await this.getServicableCity(obj)

   let contractor_product_list:any=[]
    obj.contractor_product_list.forEach((element: any) => {
      this.productList.forEach((obj: any) => {
          if (element.product_id == obj.product_id) {
            contractor_product_list.push(obj)
          }
      });
    });

    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-xl', backdrop: 'static' });
    this.contractorForm = this.fb.group({
      companyName: [obj.company_name?obj.company_name:'', [Validators.required, this.formValidationService.notEmpty]],
      firstName: [obj.first_name?obj.first_name:'', [Validators.required, this.formValidationService.notEmpty]],
      lastName: [obj.last_name?obj.last_name:'', [Validators.required, this.formValidationService.notEmpty]],
      companyPhone: [obj.company_phone?obj.company_phone:'', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      mobileNo: [obj.mobile?obj.mobile:'', [Validators.required, this.formValidationService.phoneNumberUS]],
      licenseNumber: [obj.license_no?obj.license_no:''],
    
     
      emailId: [obj.email?obj.email:'', [Validators.required, this.formValidationService.notEmpty, this.formValidationService.validEmail]],
      zipCode: [obj.zip?obj.zip:'', [Validators.required]],
      address1: [obj.address1?obj.address1:'', [Validators.required, this.formValidationService.notEmpty]],
      state: [obj.state?obj.state:'', [Validators.required]],
      city: [obj.city?obj.city:'', [Validators.required]],
      contractorsNumber: [obj.contractor_count?obj.contractor_count:'', [Validators.required]],
      serviceCity: [this.serviceCity, [Validators.required]],
      radialDistance: [obj.radial_distance?obj.radial_distance:'', [Validators.required]],
      serviceCallFee: [obj.service_call_fee?obj.service_call_fee:'', [Validators.required]],
      serviceTypes: [contractor_product_list, [Validators.required]],
      licenseFile: [obj.license_doc?obj.license_doc:null],
      active_status: [obj.active_status?true:false]
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


  getProductsList() {
    this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1`).subscribe({
      next: (val: any) => {
        this.productList = val?.data; 
      }
    });
  }

  async updateLicense(message:any) {
    if (!this.f['licenseFile'].value && !this.uploadedLicense) {
      return
    }
    const formData = new FormData();
    let fileName = this.f['licenseFile'].value.substring(this.f['licenseFile'].value.lastIndexOf("/") + 1);
    formData.append('licenseFile', this.uploadedLicense, fileName);
    this.uploadLicense(this.contractor_id, formData,message);

  }

  uploadLicense(contractor_id: string, formData: any,message:any) {
    this.apiSvc.fileupload(`${AppConfig.apiUrl.contractors.uploadLicense}/${contractor_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {    
          this.alertService.success(message);
          this.getContractorsList();
        }
      },
      error: (err) => { }, complete: () => { },
    })
  }

  async changeZip(field_name: string) {
    let inputValue: any
    if (field_name == 'zipCode') {
      inputValue = this.f['zipCode'].value.replace(/[^0-9]/g, '');
      this.validContractorCustomer = false;
      this.validZipContractorMessage = '';
    }
    this.contractorForm.patchValue({
      zipCode: inputValue
    });
    if (inputValue.length > 4) {
      let response: any = await this.commonSvc.validateZipCode(inputValue);
      if (response.status == 1) {
        if (response.data.is_serviceable == 1 && response.data.active_status == 1) {
            this.validContractorCustomer = true;
            this.contractorForm.controls['state'].setValue(response.data.state);
            this.contractorForm.controls['city'].setValue(response.data.city);
        } 
      }else {
        this.validContractorCustomer = false;
        this.contractorForm.controls['state'].setValue(null);
        this.contractorForm.controls['city'].setValue(null);
        this.validZipContractorMessage = 'Unavailable services in this zip code';
      }
    }
  }

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} contractor?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.post(AppConfig.apiUrl.contractors.updateActive, { 'active_status': obj.active_status ? 0 : 1 ,contractor_id:obj.contractor_id}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getContractorsList();
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

  
  navigateToContractorDetails(_id: any) {
    const encodedId = encodeURIComponent(btoa(_id));
    this.router.navigate([`/contractor-management/contractor-details/${encodedId}`]);
  }
}
