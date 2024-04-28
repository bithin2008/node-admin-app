import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
declare var google: any;
@Component({
  selector: 'app-policy-create',
  templateUrl: './policy-create.component.html',
  styleUrls: ['./policy-create.component.scss']
})
export class PolicyCreateComponent {
  public permissionObj: any
  public submitted = false;
  public loading = false;
  public validZipCustomerMessage: any = '';
  public validZipBillingMessage: any = '';
  public validZipCustomer: boolean = false;
  public validZipBilling: boolean = false;
  public planList = [] as any
  public propertyTypeList = [] as any
  public planTermList = [] as any
  public planTermDiscountList = [] as any
  public filterdPlanTermDiscountList = [] as any
  public addOnProductsList = [] as any
  public selectedAddOnItems = [] as any
  public bonusMonths = [] as any
  public relaventCommission: any
  public serviceCallFeesList: any
  public today = new Date()
  public customerDetails: any
  public showEscrowOrDoNotCharge = true
  holdingPeriod: any = [];
  public createPolicyForm !: FormGroup
  public isSamePropertyAddress: boolean = false;
  public policyMaxSplitCount = [] as any
  public splitPlaymentData = [] as any
  public minimumOrderPrice = 0
  public billingZipRes: any;
  public options = {
    types: ["address"],
    componentRestrictions: {
      country: 'us'
    }
  };
  controlLabels = {} as any;
  generateCreatePolicyForm() {
    this.createPolicyForm = this.fb.group({
      // customer details
      first_name_customer: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      last_name_customer: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      email_customer: ['', [Validators.required, this.formValidationSvc.validEmail]],
      mobile_customer: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      alternate_phone_customer: ['', [this.formValidationSvc.phoneNumberUS]],
      zip_customer: ['', [Validators.required, Validators.minLength(5), this.formValidationSvc.numericOnly]],
      city_customer: ['', [Validators.required]],
      state_customer: ['', [Validators.required]],
      address_customer: ['', [Validators.required]],

      // policy details
      first_name: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      last_name: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      email: ['', [Validators.required, this.formValidationSvc.validEmail]],
      mobile: ['', [Validators.required, this.formValidationSvc.phoneNumberUS]],
      //alternate_phone: ['', [this.formValidationSvc.phoneNumberUS]],
      billing_zip: ['', [Validators.required, Validators.minLength(5), this.formValidationSvc.numericOnly]],
      billing_city: ['', [Validators.required]],
      billing_state: ['', [Validators.required]],
      billing_address1: ['', [Validators.required]],
      plan_id: ['', [Validators.required]],
      property_type_id: ['', [Validators.required]],
      plan_terms_id: ['', [Validators.required]],
      plan_terms_month: [''],
      property_size_id: ['', [Validators.required]],
      selected_split_payment_count: ['1', [Validators.required]],
      holding_period: ['30', [Validators.required]],
      policy_start_date: [moment().add(30, 'days').format("YYYY-MM-DD"), [Validators.required]],
      policy_end_date: ['', [Validators.required]],
      expiry_with_bonus: ['', [Validators.required]],
      bonus_month: [0, [Validators.required]],
      policy_amount: ['', [Validators.required]],
      first_free_service: [0, [Validators.required]],
      addon_coverage_amount: [0, [Validators.required]],
      miscellaneous_charges: [0,],
      planterm_discount_id: [''],
      discount_amount: [0,],
      pcf: ['', [Validators.required]],
      policy_note: [''],
      sub_total_amount: [0, [Validators.required]],
      tax_type: ['1'],
      tax_percentage: ['', [Validators.required]],
      tax_amount: [0, [Validators.required]],
      total_price: [0, [Validators.required]],
      net_amount: [0, [Validators.required]],
      // payment details
      payment_type: ['1',],
      paymentDate: [new Date(), [Validators.required]],
      //BANK payment
      bankAccountHolderName: [''],
      bankAccountNumber: [''],
      routingNumber: [''],
      //CREDIT CARD PAYMENT
      cardHolderName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      cardNumber: ['', [Validators.required,]],
      cardExpiryDate: ['', [Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]],
      cvv: ['', [Validators.required, this.formValidationSvc.validateCVV]],
      selectedCardId: [null],
      newOrSavedCard: ['1'],
      //Escrow payment
      cheque_no: [''],
      realtor_email: ['', this.formValidationSvc.validEmail],
      agent_email: ['', this.formValidationSvc.validEmail],

    })
    this.controlLabels = {
      first_name_customer: 'Personal Information: First Name',
      last_name_customer: 'Personal Information: Last Name',
      email_customer: 'Personal Information: Email',
      mobile_customer: 'Personal Information: Mobile',
      alternate_phone_customer: 'Personal Information: Alternate Phone',
      zip_customer: 'Personal Information: Zip',
      city_customer: 'Personal Information: City',
      state_customer: 'Personal Information: State',
      address_customer: 'Personal Information: Address',

      // policy details
      first_name: 'Property Address: First Name',
      last_name: 'Property Address: Last Name',
      email: 'Property Address: Email',
      mobile: 'Property Address: Mobile',
      //alternate_phone: ['', [this.formValidationSvc.phoneNumberUS]],
      billing_zip: 'Property Address: Zip',
      billing_city: 'Property Address: City',
      billing_state: 'Property Address: State',
      billing_address1: 'Property Address: Address',
      plan_id: 'Plan Information: Plan',
      property_type_id: 'Plan Information: Property Type',
      plan_terms_id: 'Plan Information: Plan Term',
      plan_terms_month: 'Plan Information: Plan Term',
      property_size_id: 'Plan Information: Property Size',
      selected_split_payment_count: 'Plan Information: Split Payment',
      holding_period: 'Plan Information: Holding Period',
      policy_start_date: 'Plan Information: Policy Start Date',
      policy_end_date: 'Plan Information: Policy Expiry Date',
      expiry_with_bonus: 'Plan Information: Expiry With Bonus Date',
      bonus_month: 'Plan Information: Bonus Month',
      policy_amount: 'Plan Information: Policy Amount',
      first_free_service: 'Plan Information: First Free Service',
      addon_coverage_amount: 'Plan Information: Add-On Amount',
      miscellaneous_charges: 'Plan Information: Miscellaneous Charges',
      planterm_discount_id: 'Plan Information: Discount',
      discount_amount: 'Plan Information: Discount Amount',
      pcf: 'Plan Information: Service Cliam Fee (SCF)',
      policy_note: 'Policy Note',
      sub_total_amount: 'Plan Information: Subtotal (Pre-Tax)',
      tax_type: 'Plan Information: Tax Type',
      tax_percentage: 'Plan Information: Tax Percentage',
      tax_amount: 'Plan Information: Tax Amount',
      total_price: 'Plan Information: Total Price',
      net_amount: 'Plan Information: Net Amount',
      // payment details
      payment_type: 'Payment Method: Payment Type',
      paymentDate: 'Payment Method: Payment Date',
      //BANK payment
      bankAccountHolderName: 'Payment Method: Bank Account Holder Name',
      bankAccountNumber: 'Payment Method: Bank Account Number',
      routingNumber: 'Payment Method: Bank Account Routing Number',
      //CREDIT CARD PAYMENT
      cardHolderName: 'Payment Method: Card Holder Name',
      cardNumber: 'Payment Method: Card Number',
      cardExpiryDate: 'Payment Method: Card Expiry Date',
      cvv: 'Payment Method: CVV',
      selectedCardId: 'Payment Method: Selected Card',
      newOrSavedCard: 'Payment Method: New Or Saved Card',
      //Escrow payment
      cheque_no: 'Payment Method: Check No',
      realtor_email: 'Payment Method: Realtor Email',
      agent_email: 'Payment Method: Agent Email',
    }
  }
  currentParams: any
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
    this.commonSvc.setTitle('Policy Management');
    let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj = checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      }
    }
    /* this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj: any) => {
      if (permissionObj) {
        this.permissionObj = permissionObj
        if (!this.permissionObj?.add) {
          this.router.navigate(['/unauthorized']);
        }
        // Do something with the permission object
      } else {
        // Handle the case where no permission is found
      }
    }); */

  }
  ngOnInit() {
    const layoutPageContent: any = document.getElementsByClassName('layout-page-content');
    if (layoutPageContent) {
      layoutPageContent[0].classList.add('policy-page-content')
    }
    this.generateCreatePolicyForm()
    this.getAllPlans();
    this.getPlanTermDiscountList()
    this.getAllPropertyTypes();
    this.getAddOnProductList();
    this.getHoldingPeriod();

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params) {
        this.currentParams = params
        let customerEmail = params?.customer_email;
        if (customerEmail) {
          this.createPolicyForm.controls['email_customer'].setValue(customerEmail);
          this.onInputChange('email_customer');
          this.checkExistingCustomer()
        }

      }
    });
  }

  ngAfterViewInit() {
    let input: any = document.getElementById("personalAddressBar");
    const autocomplete = new google.maps.places.Autocomplete(input, this.options);
    autocomplete.addListener("place_changed", () => {
      this.createPolicyForm.patchValue({
        address_customer: input.value,
      })
      const place = autocomplete.getPlace();
      var zipCode = this.getZipCodeFromPlace(place);
      console.log('zipCode', zipCode);

      if (zipCode) {
        this.createPolicyForm.patchValue({
          zip_customer: zipCode,
        })
        this.changeZip('zip_customer');
      } else {
        this.createPolicyForm.patchValue({
          zip_customer: null,
          city_customer: null,
          state_customer: null,
        })
      }

    });


    let propertyInput: any = document.getElementById("propertyAddressBar");
    const propertyAutocomplete = new google.maps.places.Autocomplete(propertyInput, this.options);
    propertyAutocomplete.addListener("place_changed", () => {
      this.createPolicyForm.patchValue({
        billing_address1: propertyInput.value,
      })
      const propertyPlace = propertyAutocomplete.getPlace();
      var propertyZipCode = this.getZipCodeFromPlace(propertyPlace);
      console.log('zipCode', propertyZipCode);

      if (propertyZipCode) {
        this.createPolicyForm.patchValue({
          billing_zip: propertyZipCode,
        })
        this.changeZip('billing_zip');
      } else {
        this.createPolicyForm.patchValue({
          billing_zip: null,
          billing_state: null,
          billing_city: null,
        })
      }

    });

    this.formValidationSvc.forms();
  }

  getZipCodeFromPlace(place: any) {
    for (var i = 0; i < place.address_components.length; i++) {
      for (var j = 0; j < place.address_components[i].types.length; j++) {
        if (place.address_components[i].types[j] == "postal_code") {
          return place.address_components[i].long_name;

        }
      }
    }
    return null;
  }

  get f() { return this.createPolicyForm.controls; }
  changePhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'mobile_customer') {
        this.createPolicyForm.controls['mobile_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        if (this.isSamePropertyAddress) this.createPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['mobile_customer'].value));
      } else if (field_name == 'mobile') {
        this.createPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      }
    }

    this.formValidationSvc.forms()
  }

  changeAltPhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'alternate_phone_customer') {
        this.createPolicyForm.controls['alternate_phone_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        if (this.isSamePropertyAddress) {
          this.createPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['alternate_phone_customer'].value));
        }
      }
      //  else if (field_name == 'alternate_phone') {
      //   this.createPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      // }
    }

    this.formValidationSvc.forms()

  }
  appliclableTax() {
    if (this.billingZipRes) {
      switch (this.f['tax_type'].value) {
        case '1':
          this.createPolicyForm.controls['tax_percentage'].setValue(AppConfig.newYorkTax);
          break;
        case '2':
          this.createPolicyForm.controls['tax_percentage'].setValue(parseFloat((this.billingZipRes.combined_rate * 100).toFixed(2)).toString());
          break;
        case '3':
          this.createPolicyForm.controls['tax_percentage'].setValue(0);
          break;

        default:
          this.createPolicyForm.controls['tax_percentage'].setValue(null);
          break;
      }
    } else {
      this.createPolicyForm.controls['tax_percentage'].setValue(null);
    }
    this.taxAmountCalculate()
  }
  async changeZip(field_name: string) {
    let inputValue: any
    if (field_name == 'zip_customer') {
      inputValue = this.f['zip_customer'].value.replace(/[^0-9]/g, '');

      this.validZipCustomer = false;
      this.validZipCustomerMessage = '';
      this.validZipBillingMessage = '';
      if (this.isSamePropertyAddress) {
        this.validZipBilling = false;
        this.createPolicyForm.patchValue({
          zip_customer: inputValue,
          billing_zip: inputValue
        });
      } else {
        this.createPolicyForm.patchValue({
          zip_customer: inputValue,
        });
      }
    } else if (field_name == 'billing_zip') {
      inputValue = this.f['billing_zip'].value.replace(/[^0-9]/g, '');
      this.validZipBilling = false;
      this.validZipBillingMessage = '';
      this.createPolicyForm.patchValue({
        billing_zip: inputValue
      });
    }
    /*  this.createPolicyForm.patchValue({
       zipCode: inputValue
     }); */
    if (inputValue.length > 4) {

      let response: any = await this.commonSvc.validateZipCode(inputValue);
      if (response.status == 1) {
        if (response.data.is_serviceable == 1 && response.data.active_status == 1) {
          if (field_name == 'zip_customer') {
            this.validZipCustomer = true;

            this.createPolicyForm.controls['state_customer'].setValue(response.data.state);
            this.createPolicyForm.controls['city_customer'].setValue(response.data.city);
            if (this.isSamePropertyAddress) {
              this.validZipBilling = true;
              this.createPolicyForm.controls['billing_state'].setValue(response.data.state);
              this.createPolicyForm.controls['billing_city'].setValue(response.data.city);
              this.billingZipRes = response.data
              this.createPolicyForm.controls['tax_percentage'].setValue(response.data.combined_rate * 100);

            }

          } else if (field_name == 'billing_zip') {
            this.validZipBilling = true;
            this.createPolicyForm.controls['billing_state'].setValue(response.data.state);
            this.createPolicyForm.controls['billing_city'].setValue(response.data.city);
            this.createPolicyForm.controls['tax_percentage'].setValue(response.data.combined_rate * 100);
            this.billingZipRes = response.data
            this.taxAmountCalculate()

          }
        } else {
          if (field_name == 'zip_customer') {
            this.validZipCustomer = false;
            //this.validZipBilling = false;
            this.createPolicyForm.controls['state_customer'].setValue(null);
            this.createPolicyForm.controls['city_customer'].setValue(null);
            if (this.isSamePropertyAddress) {
              this.billingZipRes = null
              this.createPolicyForm.controls['billing_state'].setValue(null);
              this.createPolicyForm.controls['billing_city'].setValue(null);
              this.createPolicyForm.controls['tax_percentage'].setValue(null);
              this.validZipBillingMessage = 'Unavailable services in this zip code';
            }
            this.validZipCustomerMessage = 'Unavailable services in this zip code';

          } else {
            this.validZipBilling = false;
            this.createPolicyForm.controls['billing_state'].setValue(null);
            this.createPolicyForm.controls['billing_city'].setValue(null);
            this.createPolicyForm.controls['tax_percentage'].setValue(null);
            this.billingZipRes = null
            this.validZipBillingMessage = 'Unavailable services in this zip code';
          }
        }
      } else {
        if (field_name == 'zip_customer') {
          this.validZipCustomerMessage = response.message;
          if (this.isSamePropertyAddress) {
            this.validZipBillingMessage = response.message;;
          }
        } else {
          this.validZipBillingMessage = response.message;;
        }
      }
    } else {
      if (field_name == 'zip_customer') {
        this.createPolicyForm.controls['state_customer'].setValue(null);
        this.createPolicyForm.controls['city_customer'].setValue(null);
        if (this.isSamePropertyAddress) {
          this.createPolicyForm.controls['billing_state'].setValue(null);
          this.createPolicyForm.controls['billing_city'].setValue(null);
          this.createPolicyForm.controls['tax_percentage'].setValue(null);
          this.billingZipRes = null
        }

        this.validZipCustomerMessage = '';
      } else {
        this.createPolicyForm.controls['billing_state'].setValue(null);
        this.createPolicyForm.controls['billing_city'].setValue(null);
        this.createPolicyForm.controls['tax_percentage'].setValue(null);
        this.billingZipRes = null

        this.validZipBillingMessage = '';
      }
    }
    setTimeout(() => {
      this.appliclableTax()
    }, 500);

    this.formValidationSvc.forms()
  }
  onChangePropertyAddressCheckBox() {
    if (this.isSamePropertyAddress) {
      this.onInputChange('first_name_customer')
      this.onInputChange('last_name_customer')
      this.onInputChange('email_customer')
      this.onInputChange('address_customer');
      this.createPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['mobile_customer'].value));
      this.createPolicyForm.controls['billing_zip'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['zip_customer'].value));
      this.changePhoneFormat('mobile');
      this.changeZip('billing_zip')

    } else {
      this.createPolicyForm.patchValue({
        first_name: null,
        last_name: null,
        email: null,
        mobile: null,
        billing_zip: null,
        billing_city: null,
        billing_state: null,
        billing_address1: null,
      })
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 250);
  }
  checkValidity(controlName: any) {
    // Access the form control
    const myControl = this.createPolicyForm.get(controlName);

    // Check if the specific property is valid
    if (myControl) {
      return true
      console.log('Is myControl valid?', controlName.valid);
    } else {
      return false

    }
  }
  onInputChange(field_name: any) {
    if (field_name === 'first_name_customer') {
      this.createPolicyForm.controls['first_name'].setValue(this.f['first_name_customer'].value);
    } else if (field_name == 'last_name_customer') {
      this.createPolicyForm.controls['last_name'].setValue(this.f['last_name_customer'].value);
    } else if (field_name == 'email_customer') {
      this.createPolicyForm.controls['email'].setValue(this.f['email_customer'].value);
    } else if (field_name == 'address_customer') {
      this.createPolicyForm.controls['billing_address1'].setValue(this.f['address_customer'].value);
    }
    this.formValidationSvc.forms()
  }
  getAllPlans() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlans}?active_status=1`).subscribe({
      next: (res: any) => {
        this.planList = res.data
      },
      error: () => { },
      complete: () => { }
    });

  }

  getHoldingPeriod() {
    this.apiSvc.get(`${AppConfig.apiUrl.holding.getAllHoldingPeriod}?active_status=1`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.holdingPeriod = response?.data
        }
      }
    })
  }
  getScfValues(month: any) {
    this.apiSvc.get(`${AppConfig.apiUrl.serviceCallFees.getAllServiceCallfees}?month=${month}`).subscribe({
      next: (res: any) => {
        this.serviceCallFeesList = res.data
        if (this.serviceCallFeesList.length > 0) {
          this.serviceCallFeesList.sort((a: any, b: any) => a.scf_value - b.scf_value);
        }

      },
      error: () => { },
      complete: () => { }
    });

  }
  getAllPropertyTypes() {
    this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPropertyTypes}`).subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          this.propertyTypeList = res.data;
        } else {

        }
      },
      error: () => { },
      complete: () => { }
    });

  }
  getPlansTermList() {
    this.createPolicyForm.controls['plan_terms_id'].setValue('');
    setTimeout(() => {
      if (this.f['property_type_id'].value && this.f['plan_id'].value) {
        this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlanTerms}?property_type_id=${this.f['property_type_id'].value}&plan_id=${this.f['plan_id'].value}`).subscribe({
          next: (val: any) => {
            this.planTermList = val?.data;
            this.planTermList.sort((a: any, b: any) => a.plan_term_month - b.plan_term_month);

          }
        });
      }
    }, 500);
    this.resetCalculation();
  }
  onChangePlanTermOrPropertySize() {
    this.resetCalculation()
    if (this.f['property_size_id'].value) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });

      if (matchedObj) {
        this.policyMaxSplitCount = []
        this.splitPlaymentData = []
        if (matchedObj.max_split_payment > 1) {
          for (let i = 0; i < matchedObj.max_split_payment; i++) {
            this.policyMaxSplitCount.push(i)
          }
        }

        if (this.f['payment_type'].value == 1) {
          this.createPolicyForm.controls['paymentDate'].setValue(new Date());
        }
        this.createPolicyForm.controls['plan_terms_month'].setValue(matchedObj.plan_term_month);
        this.getScfValues(matchedObj.plan_term_month)

        this.adjustAddOnYearlyPrice()

        const endDate = moment(this.f['policy_start_date'].value).add(matchedObj.plan_term_month, 'month').format("YYYY-MM-DD");
        this.createPolicyForm.controls['policy_end_date'].setValue(endDate);
        const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
        this.createPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);

        this.createPolicyForm.controls['policy_amount'].setValue(this.f['property_size_id'].value == 0 ? matchedObj.price_below_5000_sqft : matchedObj.price_above_5000_sqft);
        this.minimumOrderPrice = this.f['property_size_id'].value == 0 ? matchedObj.min_price_below_5000_sqft : matchedObj.min_price_above_5000_sqft
        this.createPolicyForm.controls['policy_amount'].setValidators([Validators.required]);
        this.createPolicyForm.controls['policy_amount'].updateValueAndValidity();

        this.createPolicyForm.controls['sub_total_amount'].setValue(this.f['policy_amount'].value);
        this.bonusMonths = []
        for (let i = 0; i < matchedObj.bonus_month; i++) {
          this.bonusMonths.push(i + 1)

        }
        if (matchedObj.plan_term_month == 1) {
          // if plan term is monthly then escrow payment not showing 
          this.showEscrowOrDoNotCharge = false;
          this.changePaymentTab(1)
          let ccBtn: any = document.getElementsByClassName('cc-btn');
          if (ccBtn) {
            ccBtn[0].click()
          }
        } else {
          this.showEscrowOrDoNotCharge = true;
          this.changePaymentTab(1)

        }
      }
      this.calculateSubtotalPrice();
      this.formValidationSvc.forms()
    }
  }
  adjustAddOnYearlyPrice() {
    if (this.f['plan_terms_id']) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj && this.addOnProductsList.length > 0 && matchedObj.plan_term_month >= 12) {
        let year = matchedObj.plan_term_month / 12;
        this.addOnProductsList.map((product: any) => {
          product.update_yearly_price = product.yearly_price * year
        });
      }
    }
  }

  onChangeHoldingPeriod() {
    const startDate = moment().add(this.f['holding_period'].value, 'days').format("YYYY-MM-DD");
    if (startDate) {
      this.createPolicyForm.controls['policy_start_date'].setValue(startDate);
    }
    if (this.f['property_size_id'].value) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj) {
        const endDate = moment(this.f['policy_start_date'].value).add(matchedObj.plan_term_month, 'month').format("YYYY-MM-DD");
        this.createPolicyForm.controls['policy_end_date'].setValue(endDate);
        const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
        this.createPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);
        this.createPolicyForm.controls['policy_amount'].setValue(this.f['property_size_id'].value == 0 ? matchedObj.price_below_5000_sqft : matchedObj.price_above_5000_sqft);
        this.createPolicyForm.controls['sub_total_amount'].setValue(this.f['policy_amount'].value)
      }
      this.calculateSubtotalPrice()
      this.formValidationSvc.forms()
    }
    this.formValidationSvc.forms()

  }
  getAddOnProductList() {
    this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1&product_type=0`).subscribe({
      next: (val: any) => {
        val?.data.forEach((obj: any) => {
          obj.update_yearly_price = obj.yearly_price
          this.addOnProductsList.push(obj)
        });
      }
    });
  }
  onChangeAddOnItem(e: any, item: any) {
    if (e.target.checked) {
      this.selectedAddOnItems.push({ product_id: item.product_id, product_name: item.product_name, monthly_price: item.monthly_price, yearly_price: item.update_yearly_price })
    } else {
      this.selectedAddOnItems = this.selectedAddOnItems.filter((obj: any) => obj.product_id !== item.product_id);
    }
    // this.createPolicyForm.controls['discount_amount'].setValue(0);

    if (this.f['plan_terms_id']) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      this.createPolicyForm.controls['addon_coverage_amount'].setValue(0)
      if (matchedObj) {
        if (this.selectedAddOnItems.length > 0) {
          if (matchedObj.plan_term_month > 1) {
            //yearly
            // let year = matchedObj.plan_term_month / 12;
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.yearly_price;
            }, 0);
            addOnAmount = parseFloat(addOnAmount).toFixed(2)
            this.createPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);

          } else {
            //Monthly
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.monthly_price;
            }, 0);
            addOnAmount = Number(addOnAmount).toFixed(2);

            this.createPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);

          }
        }
      }
    }
    this.onChangeDiscount()

    //  this.calculateSubtotalPrice()

  }
  taxAmountCalculate() {
    if (!this.f['tax_percentage'].value) {
      this.createPolicyForm.controls['tax_amount'].setValue(0)
    }
    const miscellaneousCharges = Number(this.f['miscellaneous_charges'].value);
    const discountAmount = Number(this.f['discount_amount'].value);
    const sub_total_amount = parseFloat(this.f['sub_total_amount'].value)
    const afterDiscountAmount = Number(sub_total_amount) - discountAmount

    if ((this.f['tax_percentage'].value == 0 || this.f['tax_percentage'].value) && this.f['sub_total_amount'].value) {
      let taxPrice: any = (sub_total_amount * (this.f['tax_percentage'].value / 100))
      this.createPolicyForm.controls['tax_amount'].setValue(parseFloat(taxPrice).toFixed(2));
      let netAmount = Number(afterDiscountAmount + miscellaneousCharges + taxPrice)
      this.createPolicyForm.controls['total_price'].setValue((netAmount).toFixed(2));
      this.createPolicyForm.controls['net_amount'].setValue((netAmount).toFixed(2));
    } else {
      let netAmount = Number(afterDiscountAmount + miscellaneousCharges)
      this.createPolicyForm.controls['total_price'].setValue((netAmount).toFixed(2));
      this.createPolicyForm.controls['net_amount'].setValue((netAmount).toFixed(2));
    }
    // console.log('taxPrice',taxPrice);

    this.filterPlanTermDiscount()
    this.getComissionInfo();
    this.calculateSplitAmount()
  }
  calculateSplitAmount() {
    // Assuming this.policyMaxSplitCount is an array containing the number of splits
    if (this.f['payment_type'].value == 1 && this.f['plan_terms_id'].value && this.f['plan_terms_month'].value > 1) {

      // Get the net amount value
      const netAmount = parseFloat(this.f['net_amount'].value ? this.f['net_amount'].value : 0);
      const selected_max_split_payment = this.f['selected_split_payment_count'].value ? parseInt(this.f['selected_split_payment_count'].value) : 1
      // console.log('selected_max_split_payment', selected_max_split_payment);

      this.createPolicyForm.controls['paymentDate'].setValue(new Date());

      if (!netAmount) {
        return
      }
      if (selected_max_split_payment >= 1) {
        // Calculate the amount for each split
        const splitAmount = +(netAmount / selected_max_split_payment) // Round to two decimal places

        // Initialize the date for the first payment
        let upcomingPaymentDate = new Date();
        this.splitPlaymentData = []
        // Loop through each split count and add payments to the splitPlaymentData
        for (let i = 0; i < selected_max_split_payment; i++) {

          // Push the payment object to the splitPlaymentData
          if (splitAmount) {
            this.splitPlaymentData.push({
              payment_date: moment(upcomingPaymentDate).format("YYYY-MM-DD"),
              amount: splitAmount.toFixed(2)
            });

          }

          // Increment the date for the next payment (e.g., add one month)
          upcomingPaymentDate = new Date(upcomingPaymentDate.getTime());
          upcomingPaymentDate.setMonth(upcomingPaymentDate.getMonth() + 1);
        };
      }
    }
    this.getComissionInfo()
  }

  calculateSubtotalPrice() {
    if (this.f['plan_terms_id']) {
      /*  let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
       this.createPolicyForm.controls['addon_coverage_amount'].setValue(0)
       if (matchedObj) {
         if (this.selectedAddOnItems.length > 0) {
           if (matchedObj.plan_term_month > 1) {
             //yearly
             let year = matchedObj.plan_term_month / 12;
             let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
               return accumulator + (currentValue.yearly_price * year);
             }, 0);
             addOnAmount = parseFloat(addOnAmount).toFixed(2)
             this.createPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);
 
           } else {
             //Monthly
             let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
               return accumulator + currentValue.monthly_price;
             }, 0);
             addOnAmount = Number(addOnAmount).toFixed(2);
 
             this.createPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
 
           }
         }
       } */

      // Calculate Subtotal
      if (this.f['policy_amount'].value) {
        if (this.f['addon_coverage_amount'].value) {
          const policyAmount = Number(this.f['policy_amount'].value);
          const addonCoverageAmount = this.f['addon_coverage_amount'].value ? Number(this.f['addon_coverage_amount'].value) : 0;
          // const miscellaneousCharges = Number(this.f['miscellaneous_charges'].value);
          // const discountAmount = Number(this.f['discount_amount'].value);
          let sub_total_amount = policyAmount + addonCoverageAmount;
          this.createPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount.toFixed(2));

          // this.createPolicyForm.controls['total_price'].setValue(sub_total_amount.toFixed(2));
          // this.createPolicyForm.controls['net_amount'].setValue(sub_total_amount.toFixed(2));
        } else {

          let sub_total_amount = parseFloat(this.f['policy_amount'].value).toFixed(2)
          this.createPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount)
          // const miscellaneousCharges = Number(this.f['miscellaneous_charges'].value);
          // const discountAmount = Number(this.f['discount_amount'].value);

          // let afterDiscountAmount = Number(sub_total_amount)-discountAmount
          // let netAmount=Number(afterDiscountAmount +miscellaneousCharges )
          // this.createPolicyForm.controls['total_price'].setValue(parseFloat(netAmount.toFixed(2)))
          // this.createPolicyForm.controls['net_amount'].setValue(parseFloat(netAmount.toFixed(2)))
        }


      }
      this.taxAmountCalculate()
    }
    this.formValidationSvc.forms()

  }
  resetCalculation() {
    this.createPolicyForm.controls['first_free_service'].setValue(0)
    this.createPolicyForm.controls['holding_period'].setValue(30)
    this.createPolicyForm.controls['policy_start_date'].setValue(moment().add(30, 'days').format("YYYY-MM-DD"));
    this.createPolicyForm.controls['policy_end_date'].setValue(null)
    this.createPolicyForm.controls['pcf'].setValue(null)
    this.createPolicyForm.controls['expiry_with_bonus'].setValue(null)
    this.createPolicyForm.controls['policy_amount'].setValue(0)
    this.createPolicyForm.controls['miscellaneous_charges'].setValue(0)
    this.createPolicyForm.controls['discount_amount'].setValue(0)
    this.selectedAddOnItems = []
    this.createPolicyForm.controls['addon_coverage_amount'].setValue(0)
    this.createPolicyForm.controls['sub_total_amount'].setValue(0)
    // this.createPolicyForm.controls['tax_percentage'].setValue(0)
    this.createPolicyForm.controls['tax_amount'].setValue(0)
    this.createPolicyForm.controls['total_price'].setValue(0)
    this.createPolicyForm.controls['net_amount'].setValue(0)
    this.relaventCommission = null
    const addOnCheckboxes: any = Array.from(document.querySelectorAll(`.selectedAddOnItems`));
    addOnCheckboxes.forEach((checkbox: any, index: number) => { checkbox.checked = false; });
    this.submitted = false
  }
  getComissionInfo() {
    // console.log('getComissionInfo called');

    if (this.f['plan_terms_id'].value && this.f['sub_total_amount'].value && this.f['net_amount'].value) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj) {
        let subtotal_amount = parseFloat(this.f['sub_total_amount'].value)
        let miscellaneous_charges = parseFloat(this.f['miscellaneous_charges'].value ? this.f['miscellaneous_charges'].value : 0)
        let amount: any = subtotal_amount + miscellaneous_charges
        let discount_amount = this.f['discount_amount'].value ? this.f['discount_amount'].value : 0
        let totalAmount: any = this.f['net_amount'].value// amount - discount_amount
        let payload = {
          policy_term_months: matchedObj.plan_term_month,
          subtotal_amount: totalAmount ? parseFloat(totalAmount).toFixed(2) : 0
        }
        // Listen for changes in sub_total_amount control value

        this.apiSvc.post(AppConfig.apiUrl.commissions.getRelaventCommission, payload).pipe(
          debounceTime(500)).subscribe({
            next: (response: any) => {
              if (response.status = 1) {
                this.relaventCommission = response.data;
                // console.log(this.relaventCommission);
                // same day payment dobule commision calculation
                if (this.f['paymentDate'].value) {
                  const paymentDate = moment(this.f['paymentDate'].value);
                  const today = moment();
                  if (paymentDate.isSame(today, 'day') && this.f['selected_split_payment_count'].value == 1 && today.day() !== 0 && this.f['plan_terms_month'].value > 12 && this.f['payment_type'].value == 1) {
                    if (this.relaventCommission) {
                      let commission_value = (this.relaventCommission.commission_value * 2)
                      this.relaventCommission.commission_value = commission_value
                    }
                  }
                }
              } else {
                this.alertService.warning(response.message)
              }
            },
          })
      }
    }
  }
  onChangeBonusMonth() {
    const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
    this.createPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);

  };

  changePaymentTab(payment_type: any) {

    this.clearPreviousTabValues();  // Clear previous tab values
    switch (payment_type) {
      case 1: // Credit Card Payment
        this.clearBankValidators();
        this.setValidators('paymentDate', [Validators.required]);
        this.setValidators('cardHolderName', [Validators.required]);
        this.setValidators('cardNumber', [Validators.required]);
        this.setValidators('cardExpiryDate', [Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]);
        this.setValidators('cvv', [Validators.required,]);
        this.createPolicyForm.controls['paymentDate'].setValue(new Date());
        if (this.customerDetails?.card_list?.length > 0) {
          this.createPolicyForm.controls['newOrSavedCard'].setValue('2');
          if (this.f['newOrSavedCard'].value == 2) {
            this.createPolicyForm.controls['cardNumber'].clearValidators();
          } else {
            this.setValidators('cardNumber', [Validators.required]);
          }
          this.onChangeNewOrSavedCard()
        }

        break;

      case 2: // Bank Payment
        this.clearPreviousTabValues();
        this.clearCreditCardValidators();
        this.setValidators('paymentDate', [Validators.required]);
        this.setValidators('bankAccountHolderName', [Validators.required]);
        this.setValidators('bankAccountNumber', [Validators.required]);
        this.setValidators('routingNumber', [Validators.required]);
        this.createPolicyForm.controls['cardNumber'].clearValidators();
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.createPolicyForm.controls['cardNumber'].setValue(null);
        break;

      case 3: // Escrow Payment
        this.clearPreviousTabValues();
        this.clearCreditCardValidators();
        this.clearBankValidators();
        this.createPolicyForm.controls['cvv'].clearValidators();
        this.createPolicyForm.controls['cvv'].updateValueAndValidity();
        this.createPolicyForm.controls['cardNumber'].setValue(null);
        this.createPolicyForm.controls['cardNumber'].clearValidators();
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.createPolicyForm.controls['paymentDate'].clearValidators();
        this.createPolicyForm.controls['paymentDate'].updateValueAndValidity();
        this.createPolicyForm.controls['paymentDate'].setValue(null);
        this.setValidators('realtor_email', [this.formValidationSvc.validEmail]);
        this.setValidators('agent_email', [this.formValidationSvc.validEmail]);

        break;
      case 4: // Do not charge Payment
        this.clearPreviousTabValues();
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.createPolicyForm.controls['paymentDate'].clearValidators();
        this.createPolicyForm.controls['paymentDate'].updateValueAndValidity();
        this.createPolicyForm.controls['cvv'].clearValidators();
        this.createPolicyForm.controls['cvv'].updateValueAndValidity();
        this.createPolicyForm.controls['cardNumber'].clearValidators();
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.createPolicyForm.controls['cardNumber'].setValue(null);
        break;
      case 5: // Send Payment Link Payment
        this.clearPreviousTabValues();
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.createPolicyForm.controls['paymentDate'].setValue(new Date());
        this.createPolicyForm.controls['cvv'].clearValidators();
        this.createPolicyForm.controls['cvv'].updateValueAndValidity();
        this.createPolicyForm.controls['cardNumber'].setValue(null);
        this.createPolicyForm.controls['cardNumber'].clearValidators();
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        break;
      default:
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.createPolicyForm.controls['cvv'].clearValidators();
        this.createPolicyForm.controls['cvv'].updateValueAndValidity();
        this.createPolicyForm.controls['cardNumber'].setValue(null);
        this.createPolicyForm.controls['cardNumber'].clearValidators();
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        break;
    }
    this.createPolicyForm.controls['payment_type'].setValue(payment_type);
    this.formValidationSvc.forms();
    this.getComissionInfo()
  }
  clearPreviousTabValues() {
    const controlsToClear = [
      'cardHolderName',
      'cardNumber',
      'cardExpiryDate',
      'cvv',
      'bankAccountHolderName',
      'bankAccountNumber',
      'routingNumber',
      'paymentDate',
      'selectedCardId',
      'cheque_no',
      'newOrSavedCard',
      'agent_email',
      'realtor_email'
    ];

    controlsToClear.forEach(controlName => {
      this.createPolicyForm.get(controlName)?.setValue(null);
      this.clearValidators(controlName);
    });
  }
  clearBankValidators() {
    this.clearValidators('bankAccountHolderName');
    this.clearValidators('bankAccountNumber');
    this.clearValidators('routingNumber');
    this.clearValidators('paymentDate');
  }

  clearCreditCardValidators() {
    this.clearValidators('cardHolderName');
    this.clearValidators('cardNumber');
    this.clearValidators('cardExpiryDate');
    this.clearValidators('cvv');
    this.clearValidators('paymentDate');
  }

  setValidators(controlName: string, validators: ValidatorFn[]) {
    const control = this.createPolicyForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  clearValidators(controlName: string) {
    const control = this.createPolicyForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  onSubmit() {
    this.submitted = true;
  /*   if (this.f['payment_type'].value!=1) {
      this.clearCreditCardValidators()
    } */
    if (this.createPolicyForm.valid && this.validZipBilling && this.validZipCustomer && this.f['net_amount'].value > 0) {
      if (this.f['net_amount'].value < this.minimumOrderPrice) {
        this.alertService.warning(`The Total amount should not be less than $${this.minimumOrderPrice.toFixed(2)}`)
        return
      }
      let formValue: any = { ...this.createPolicyForm.value };
      formValue.mobile = this.commonSvc.convertToNormalPhoneNumber(formValue.mobile);
      // formValue.alternate_phone = this.commonSvc.convertToNormalPhoneNumber(formValue.alternate_phone);
      formValue.paymentDate = formValue.paymentDate ? moment(formValue.paymentDate).format('YYYY-MM-DD') : null;
      formValue.cardExpiryDate = formValue.payment_type == 1 ? formValue.cardExpiryDate.replace(/\//g, '') : null;
      formValue.cardNumber = formValue.cardNumber ? formValue.cardNumber.replace(/\s+/g, '') : null
      let commission_value: any = 0
      if (this.relaventCommission) {
        if (this.relaventCommission.price_percentage == 1) {
          commission_value = (this.f['sub_total_amount'].value * this.relaventCommission.commission_value / 100)
        } else {
          commission_value = parseFloat(this.relaventCommission.commission_value.toFixed(2))
        }
      }
      let discount_amount: any = formValue.discount_amount ? parseFloat(formValue.discount_amount.toFixed(2)) : 0
      let customerData = {
        first_name: formValue.first_name_customer,
        last_name: formValue.last_name_customer,
        email: formValue.email_customer,
        mobile: this.commonSvc.convertToNormalPhoneNumber(formValue.mobile_customer),
        alternate_phone: this.commonSvc.convertToNormalPhoneNumber(formValue.alternate_phone_customer),
        zip: formValue.zip_customer,
        address1: formValue.address_customer,
        state: formValue.state_customer,
        city: formValue.city_customer,
      }
      delete formValue.first_name_customer
      delete formValue.first_name_customer;
      delete formValue.last_name_customer;
      delete formValue.email_customer;
      delete formValue.mobile_customer;
      delete formValue.alternate_phone_customer;
      delete formValue.zip_customer;
      delete formValue.address_customer;
      delete formValue.state_customer;
      delete formValue.city_customer;
      delete formValue.discount_amount;
      let payload = {
        customerData,
        policyPayamentData: [
          {
            ...formValue,
            selectedAddOnItems: this.selectedAddOnItems,
            commission_value: commission_value ? parseFloat(commission_value).toFixed(2) : 0,
            commission_type: 1,
            discount_amount: discount_amount,
            splitPlaymentData: this.splitPlaymentData
          }
        ]
      }
      // console.log('payload', payload);
      console.log('policy form value', payload);

      this.loading = true;
      this.apiSvc.post(`${AppConfig.apiUrl.policy.createPolicy}`, payload).subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            this.loading = false;
            this.createPolicyForm.reset();
            setTimeout(() => {
              this.generateCreatePolicyForm();

              this.createPolicyForm.controls['newOrSavedCard'].setValue('1');
              this.createPolicyForm.controls['bonus_month'].setValue(0);
              this.createPolicyForm.controls['expiry_with_bonus'].setValue(null);
              this.customerDetails = null
              this.relaventCommission = null
              this.alertService.success(res.message);
              this.splitPlaymentData = []
              this.policyMaxSplitCount = []
              this.submitted = false;
              this.cdRef.detectChanges();
            }, 200);
            if (res?.createdPolicy.policy_number) {
              this.router.navigate([`/policy-management/thank-you`], {
                queryParams: {
                  policy_number: res?.createdPolicy.policy_number,
                },
              });

            } else {
              this.router.navigate(['/policy-management']);

            }

          } else {
            this.loading = false;
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });

    } else {
      console.log('this.createPolicyForm', this.createPolicyForm);
      console.log('this.validZipBilling', this.validZipBilling);
      console.log('this.validZipCustomer', this.validZipCustomer);
      this.logInvalidControls(this.createPolicyForm);

      // this.alertService.error(`One or more mandatory fields are still blank. Please fill up all the mandatory fields to proceed. `)
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.createPolicyForm);
    }
  }
  changePaymentDate(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }

  async checkExistingCustomer() {
    if (this.f['email_customer'].value) {
      if (this.f['email_customer'].value?.match(/^(?!.*([.])\1{1})([\w\.\-\+\<\>\{\}\=\`\|\?]+)@(?![.-])([a-zA-Z\d.-]+)\.([a-zA-Z.][a-zA-Z]{1,6})$/)) {
        const response: any = await this.getCustomerDetails(this.f['email_customer'].value)
        if (response.status == 1) {
          this.alertService.success(response.message)
          this.customerDetails = response.data;
          let cardListRes: any = await this.getCustomerCardList(this.customerDetails.customer_id);
          this.customerDetails.card_list = cardListRes.data?.length > 0 ? cardListRes.data : []
          this.createPolicyForm.controls['first_name_customer'].setValue(this.customerDetails.first_name);
          this.createPolicyForm.controls['last_name_customer'].setValue(this.customerDetails.last_name);
          this.createPolicyForm.controls['address_customer'].setValue(this.customerDetails.address1);
          this.onInputChange('first_name_customer');
          this.onInputChange('last_name_customer');
          this.onInputChange('address_customer');
          this.createPolicyForm.controls['email'].setValue(this.f['email_customer'].value);
          this.createPolicyForm.controls['zip_customer'].setValue(this.customerDetails.zip);
          this.createPolicyForm.controls['billing_zip'].setValue(this.customerDetails.zip);
          this.changeZip('zip_customer');
          this.changeZip('billing_zip');
          this.createPolicyForm.controls['mobile_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.customerDetails.mobile));
          this.createPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.customerDetails.mobile));
          // this.createPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.customerDetails.alternate_phone));
          //this.changePhoneFormat('mobile_customer');
          //  this.changePhoneFormat('alternate_phone');
          this.isSamePropertyAddress = true
          let selctedCardDetails = this.customerDetails?.card_list.filter((o: any) => o.primary_card == true)[0];
          if (selctedCardDetails) {
            this.createPolicyForm.controls['payment_type'].setValue(1);
            this.createPolicyForm.controls['cardNumber'].clearValidators();
            this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
            this.createPolicyForm.controls['cvv'].clearValidators();
            this.createPolicyForm.controls['cvv'].updateValueAndValidity();
            this.createPolicyForm.controls['newOrSavedCard'].setValue('2');
            this.createPolicyForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
            this.createPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
            this.createPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
            let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
            this.createPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
          }
          setTimeout(() => {
            this.formValidationSvc.forms();
          }, 500);
        } else {
          this.customerDetails = null;
          this.createPolicyForm.controls['selectedCardId'].setValue(null);
          this.createPolicyForm.controls['cardNumber'].setValue(null);
          this.createPolicyForm.controls['cardExpiryDate'].setValue(null);
          this.createPolicyForm.controls['paymentDate'].setValue(new Date());
          this.createPolicyForm.controls['cardHolderName'].setValue(null);
          this.createPolicyForm.controls['cvv'].setValue(null);
          this.createPolicyForm.controls['cardNumber'].setValidators([Validators.required,]);
          this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
          this.createPolicyForm.controls['cvv'].setValidators([Validators.required,]);
          this.createPolicyForm.controls['cvv'].updateValueAndValidity();
        }

      } else {
        this.customerDetails = null
        this.createPolicyForm.controls['selectedCardId'].setValue(null);
        this.createPolicyForm.controls['cardNumber'].setValue(null);
        this.createPolicyForm.controls['cardExpiryDate'].setValue(null);
        this.createPolicyForm.controls['paymentDate'].setValue(new Date());
        this.createPolicyForm.controls['cardHolderName'].setValue(null);
        this.createPolicyForm.controls['cvv'].setValue(null);
        this.createPolicyForm.controls['cardNumber'].setValidators([Validators.required,]);
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.createPolicyForm.controls['cvv'].setValidators([Validators.required,]);
        this.createPolicyForm.controls['cvv'].updateValueAndValidity();
      }
    }
  }
  getCustomerDetails(email: string) {
    return new Promise<void>((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getCustomerDetails}/${email}`, '').subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (err) => {
          reject(err)
        },
      })
    })

  };
  getCustomerCardList(customerId: any) {
    return new Promise<void>((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.customerCards.getCustomerAllSavedCardList}/${customerId}`, '').subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (err) => {
          reject(err)
        },
      })
    })
  }
  getPlanTermDiscountList() {
    this.apiSvc.post(`${AppConfig.apiUrl.planTermDiscount.getAllPlanTermDiscounts}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let planTermDiscountList = response.data
          this.planTermDiscountList = planTermDiscountList
        }
      },
      error: () => { },
      complete: () => { }
    })
  };
  filterPlanTermDiscount() {
    this.filterdPlanTermDiscountList = [];
    if (this.f['plan_terms_id'].value && this.f['sub_total_amount'].value && this.planTermDiscountList.length > 0) {
      const matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });

      if (matchedObj) {
        const filteredDiscountList = [...this.planTermDiscountList].filter((e: any) => e.plan_term == matchedObj.plan_term_month);
        filteredDiscountList.forEach((element: any) => {
          if (element.price_percentage == 0) {
            //price

            element.discount_amount = element.discount_value
            element.discount_label = `$${element.discount_value} Flat Off`

          } else {
            // percentage
            const sub_total_amount = parseFloat(this.f['sub_total_amount'].value)
            let discountAmount: any = (sub_total_amount * (element.discount_value / 100));
            element.discount_amount = discountAmount
            element.discount_label = `${element.discount_value}% Off`
          }
        });

        // Assign filteredDiscountList to another variable or property instead of directly modifying this.planTermDiscountList
        // For example:
        this.filterdPlanTermDiscountList = filteredDiscountList; // Store it in another property
        //  console.log(' this.filterdPlanTermDiscountList', this.filterdPlanTermDiscountList);

      }
    }
  }
  onChangeFreeServiceCall(ev: any) {
    this.createPolicyForm.controls['first_free_service'].setValue(ev.target.checked ? 1 : 0)
  }

  onChangecard() {
    if (this.f['selectedCardId'].value) {
      let customer_card_id = this.f['selectedCardId'].value;
      // this.createPolicyForm.controls['selectedCardId'].setValue(customer_card_id)
      let selctedCardDetails = this.customerDetails?.card_list.filter((o: any) => o.customer_card_id == customer_card_id)[0];
      if (selctedCardDetails) {
        this.createPolicyForm.controls['payment_type'].setValue(1);
        this.createPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.createPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.createPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }
    }
  }
  onChangeNewOrSavedCard() {
    if (this.f['newOrSavedCard'].value == 2) {
      let selctedCardDetails = this.customerDetails?.card_list.filter((o: any) => o.primary_card == true)[0];
      if (selctedCardDetails) {
        this.createPolicyForm.controls['payment_type'].setValue(1);
        this.createPolicyForm.controls['cardNumber'].clearValidators();
        this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.createPolicyForm.controls['cvv'].clearValidators();
        this.createPolicyForm.controls['cvv'].updateValueAndValidity();
        this.createPolicyForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
        this.createPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.createPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.createPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }

    } else {
      this.createPolicyForm.controls['payment_type'].setValue(1);
      this.createPolicyForm.controls['cardNumber'].setValidators([Validators.required,]);
      this.createPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.createPolicyForm.controls['cvv'].setValidators([Validators.required,]);
      this.createPolicyForm.controls['cvv'].updateValueAndValidity();
      this.createPolicyForm.controls['selectedCardId'].setValue(null);
      this.createPolicyForm.controls['cardNumber'].setValue(null);
      this.createPolicyForm.controls['cardExpiryDate'].setValue(null);
      this.createPolicyForm.controls['cardHolderName'].setValue(null);
      this.createPolicyForm.controls['cvv'].setValue(null);
    }
    this.createPolicyForm.controls['paymentDate'].setValue(new Date());

    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 100);
  }
  onChangeDiscount() {
    if (!this.f['planterm_discount_id'].value) {
      this.createPolicyForm.controls['discount_amount'].setValue(0);
      this.calculateSubtotalPrice()
      return
    }
    this.filterPlanTermDiscount()
    setTimeout(() => {
      const matchedObj = _.find(this.filterdPlanTermDiscountList, { 'planterm_discount_id': parseInt(this.f['planterm_discount_id'].value) });
      if (matchedObj) {
        if (matchedObj.price_percentage == 0) {
          //price
          matchedObj.discount_amount = matchedObj.discount_value
        } else {
          // percentage
          const sub_total_amount = parseFloat(this.f['sub_total_amount'].value)
          let discountAmount: any = (sub_total_amount * (matchedObj.discount_value / 100));
          matchedObj.discount_amount = discountAmount
        }
        this.createPolicyForm.controls['discount_amount'].setValue(matchedObj.discount_amount);
      }
      this.calculateSubtotalPrice()
    }, 300);

  }

  logInvalidControls(formGroup: FormGroup) {
    // Define error messages for specific conditions
    let errorMessage = '';
    if (!this.validZipBilling) {
      errorMessage += 'Property Address: Invalid zip. ';
    }
    if (!this.validZipCustomer) {
      errorMessage += 'Personal Information: Invalid zip. ';
    }
    if (this.f['net_amount'].value <= 0) {
      errorMessage += 'Net amount must be greater than 0. ';
    }

    // Display error message if any condition is not met
    if (!this.createPolicyForm.valid) {
      for (const field in formGroup.controls) {
        const control: any = formGroup.get(field);
        if (control.invalid) {
          const fieldLabel = this.controlLabels[field] || field; // Use the label from the mapping or the control name itself
          this.alertService.error(`${fieldLabel} is a mandatory field. Please fill up all the mandatory fields to proceed.`);
          console.error(`Invalid control: ${field}`);

          // Handle the first invalid control only
          control.markAsTouched(); // Mark the control as touched to trigger validation messages
          control.markAsDirty(); // Mark the control as dirty to display validation messages immediately
          break; // Exit the loop after handling the first invalid control
        }
      }
    } else if (errorMessage) {
      this.alertService.error(errorMessage);
    }
  }


  ngOnDestroy() {
    const layoutPageContent: any = document.getElementsByClassName('layout-page-content');
    if (layoutPageContent) {
      layoutPageContent[0].classList.remove('policy-page-content')
    }
    this.clearQueryParams();
  }

  // === Clear Query Params From URL ===
  private clearQueryParams(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('?')) {
      // Split the URL into path and query params
      const [path, queryParams] = currentUrl.split('?');
      // Navigate to the same path with empty query params
      this.router.navigate([path], { queryParams: {} });
    }
  }
  
}


