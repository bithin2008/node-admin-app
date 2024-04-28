import { ChangeDetectorRef, Component, NgZone, TemplateRef } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-contractor-details',
  templateUrl: './contractor-details.component.html',
  styleUrls: ['./contractor-details.component.scss']
})
export class ContractorDetailsComponent {
  permissionObj: any;
  contractor_id: any;
  assignJobList: any = [];
  serviceLocations: any = [];
  seriviceJobPending: any = [];
  contractorProductList: any = [];
  contractorDetails: any = {};
  contractorForm: any;
  zipCodeList: any = [];
  serviceCity: any = [];
  productList: any = [];
  validContractorCustomer: boolean = false;
  validZipContractorMessage: string = '';
  modalRef?: BsModalRef | null;
  isEdit: boolean = false;
  public submitted!: boolean;
  loading: boolean = false;
  uploadedLicense: any = null;

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
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private zone: NgZone

  ) {
    this.commonSvc.setTitle('Contractor Details');
    let currentRoute= 'contractor-management';
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // this.commonSvc.checkAccessPermission('contractor-management').subscribe((permissionObj: any) => {
    //   if (permissionObj) {
    //     this.permissionObj = permissionObj
    //     if (!this.permissionObj.view) {
    //       this.router.navigate(['/unauthorized']);
    //     }
    //     // Do something with the permission object
    //   } else {
    //     // Handle the case where no permission is found
    //   }
    // });
    this.activatedRoute.paramMap.subscribe((params) => {
      const encodedId: any = params.get('contractor_id');
      this.contractor_id = atob(decodeURIComponent(encodedId));
    });
  }

  ngOnInit() {
    this.getContractorDetails();
    this.getProductsList();
  }
  getServicableLocation(locations: any) {
    try {
      let data = locations ? JSON.parse(locations) : []
      return data ? data : []
    } catch (error) {
      return []
    }


  }

  getContractorDetails() {
    this.apiSvc.post(`${AppConfig.apiUrl.contractors.contractorAssignJob}/${this.contractor_id}`, '').subscribe({
      next: (response: any) => {
        this.contractorDetails = response?.data;
       // if (response.data.service_location.constructor === Array) {
          this.serviceLocations = this.getServicableLocation(response.data.service_location)
       // } else {
         // this.serviceLocations = [response.data.service_location]
       // }

        // this.serviceLocations = this.getServicableLocation(response.data.service_location)//response?.data?.service_location?JSON.parse(response.data.service_location):[]
        this.contractorProductList = response?.data?.contractor_product_list ? response?.data?.contractor_product_list : []
        // if(response?.data?.contractor_product_list.constructor === Array){

        // }else{
        //   this.contractorProductList =  [{product_name:response?.data?.contractor_product_list}]
        // }




        this.assignJobList = response?.data?.assign_jobs;
        this.seriviceJobPending = this.assignJobList.filter((item: any) => item.job_status == 1)

      }
    })
  }
  getProductsList() {
    this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1`).subscribe({
      next: (val: any) => {
        this.productList = val?.data;
      }
    });
  }

  navigateToEditClaim(Claim_id: any) {
    const encodedId = encodeURIComponent(btoa(Claim_id));
    this.router.navigate([`/claim-management/edit-claim/${encodedId}`]);
  }
  navigateToCustomerDetails(customer_id: any) {
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }


  getServicableCity(obj: any) {
    try {
      let servicableZip = JSON.parse(obj.service_location);
      return servicableZip.length > 0 ? servicableZip : [];
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  }

  async openAddEditModal(template: TemplateRef<any>, obj: any) {
    this.contractor_id = obj.contractor_id;
    this.serviceCity = await this.getServicableCity(obj)

    let contractor_product_list: any = []
    obj.contractor_product_list.forEach((element: any) => {
      this.productList.forEach((obj: any) => {
        if (element.product_id == obj.product_id) {
          contractor_product_list.push(obj)
        }
      });
    });

    this.modalRef = this.mdlSvc.show(template, { id: 1, class: 'modal-xl', backdrop: 'static' });
    this.contractorForm = this.fb.group({
      companyName: [obj.company_name ? obj.company_name : '', [Validators.required, this.formValidationService.notEmpty]],
      firstName: [obj.first_name ? obj.first_name : '', [Validators.required, this.formValidationService.notEmpty]],
      lastName: [obj.last_name ? obj.last_name : '', [Validators.required, this.formValidationService.notEmpty]],
      companyPhone: [obj.company_phone ? obj.company_phone : '', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      mobileNo: [obj.mobile ? obj.mobile : '', [Validators.required, this.formValidationService.phoneNumberUS]],
      licenseNumber: [obj.license_no ? obj.license_no : ''],


      emailId: [obj.email ? obj.email : '', [Validators.required, this.formValidationService.notEmpty, this.formValidationService.validEmail]],
      zipCode: [obj.zip ? obj.zip : '', [Validators.required]],
      address1: [obj.address1 ? obj.address1 : '', [Validators.required, this.formValidationService.notEmpty]],
      state: [obj.state ? obj.state : '', [Validators.required]],
      city: [obj.city ? obj.city : '', [Validators.required]],
      contractorsNumber: [obj.contractor_count ?obj.contractor_count : '', [Validators.required]],
      serviceCity: [this.serviceCity, [Validators.required]],
      radialDistance: [obj.radial_distance ? obj.radial_distance : '', [Validators.required]],
      serviceCallFee: [obj.service_call_fee ? obj.service_call_fee : '', [Validators.required]],
      serviceTypes: [contractor_product_list, [Validators.required]],
      licenseFile: [obj.license_doc ? obj.license_doc : null],
      active_status: [obj.active_status ? true : false]
    });
    if (obj) {
      this.isEdit = true;
    } else {
      this.isEdit = false;
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 500);

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
  }

  onSubmit() {
    if (this.contractorForm.valid) {
      this.loading = true;
      let data = { ...this.contractorForm.value, contractor_id: this.contractor_id };
      this.apiSvc.post(AppConfig.apiUrl.contractors.updateContractor, data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            if (this.uploadedLicense) {
              this.updateLicense(response.message)
            } else {
              this.alertService.success(response.message);
              this.getContractorDetails();
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
    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.contractorForm);
    }
  }

  async updateLicense(message: any) {
    if (!this.f['licenseFile'].value && !this.uploadedLicense) {
      return
    }
    const formData = new FormData();
    let fileName = this.f['licenseFile'].value.substring(this.f['licenseFile'].value.lastIndexOf("/") + 1);
    formData.append('licenseFile', this.uploadedLicense, fileName);
    this.uploadLicense(this.contractor_id, formData, message);

  }
  uploadLicense(contractor_id: string, formData: any, message: any) {
    this.apiSvc.fileupload(`${AppConfig.apiUrl.contractors.uploadLicense}/${contractor_id}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(message);
          this.getContractorDetails();
        }
      },
      error: (err) => { }, complete: () => { },
    })
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
        licenseFile: event.target.files[0] ? event.target.files[0].name : null
      })
    } else {
      this.alertService.warning('Only docs, pdf formats are supported');
      this.contractorForm.patchValue({
        licenseFile: null
      })
      return
    }
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
      } else {
        this.validContractorCustomer = false;
        this.contractorForm.controls['state'].setValue(null);
        this.contractorForm.controls['city'].setValue(null);
        this.validZipContractorMessage = 'Unavailable services in this zip code';
      }
    }
  }

  closeAddEditModal() {
    this.submitted = false;
    this.contractorForm.reset();
    this.modalRef?.hide();
    this.loading = false;
    this.isEdit = false;
  }
}
