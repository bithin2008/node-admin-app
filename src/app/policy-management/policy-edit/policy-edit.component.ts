import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime } from 'rxjs';
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
  selector: 'app-policy-edit',
  templateUrl: './policy-edit.component.html',
  styleUrls: ['./policy-edit.component.scss']
})
export class PolicyEditComponent {
  public permissionObj: any;
  public policyId: any;
  public submitted = false;
  public loading = false;
  public validZipCustomerMessage: any = '';
  public validZipBillingMessage: any = '';
  public validZipCustomer: boolean = false;
  public validZipBilling: boolean = false;
  public planList = [] as any
  public propertyTypeList = [] as any
  public planTermList = [] as any
  public addOnProductsList = [] as any
  public constrantAddOnProductsList = [] as any
  public selectedAddOnItems = [] as any
  public bonusMonths = [] as any
  public relaventCommission: any
  public today = new Date()
  public serviceCallFeesList: any
  public policyDetails: any
  public editPolicyForm: FormGroup | any
  public showPayment: boolean = false
  public showEscrowOrDoNotCharge = true
  public billingZipRes: any
  public minimumOrderPrice = 0
  holdingPeriod: any = [];
  public options = {
    types: ["address"],
    componentRestrictions: {
      country: 'us'
    }
  };
  imgSrc: any = 'assets/img/allCardIcon/credit-card.svg';
  controlLabels = {} as any;


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
    this.commonSvc.setTitle('Policy Edit');
    let permissionObj = checkAccessPermission('policy-management');
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      }
    }
    // this.commonSvc.checkAccessPermission('policy-management').subscribe((permissionObj: any) => {
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
      const encodedId: any = params.get('policy_id');
      this.policyId = atob(decodeURIComponent(encodedId));

    });
  }
  async ngOnInit() {
    const layoutPageContent: any = document.getElementsByClassName('layout-page-content');
    if (layoutPageContent) {
      layoutPageContent[0].classList.add('policy-page-content')
    }
    this.getAllPlans();
    this.getAllPropertyTypes();
    this.getAddOnProductList();
  }
  ngAfterViewInit() {
    if (this.policyId) {
      this.declareEditPolicyForm(false);
    }

    // let input: any = document.getElementById("addressBar");
    // const autocomplete = new google.maps.places.Autocomplete(input, this.options);
    // autocomplete.addListener("place_changed", () => {
    //   this.editPolicyForm.patchValue({
    //     billing_address1: input.value,
    //   })
    //   const place = autocomplete.getPlace();
    //   var zipCode = this.getZipCodeFromPlace(place);
    //   console.log('zipCode', zipCode);

    //   if (zipCode) {
    //     this.editPolicyForm.patchValue({
    //       billing_zip: zipCode,
    //     })

    //   //  this.chekcBillingZipCode(zipData);
    //   this.changeZip('billing_zip');

    //   }
    // });
    this.formValidationSvc.forms()
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

  get f() { return this.editPolicyForm.controls; }

  async declareEditPolicyForm(isSubmit: boolean) {
    const response: any = await this.getPolicyDetails();
    
    if (response.status == 1) {
      this.policyDetails = response.data
      for (let i = 0; i < this.policyDetails.bonus_month; i++) {
        this.bonusMonths.push(i + 1)
      }
      if (this.policyDetails?.plan_term_details?.plan_term_month == 1) {
        this.showEscrowOrDoNotCharge = false;
      }
      let taxPercentage = this.policyDetails.taxPercentage ? this.policyDetails.taxPercentage : parseFloat(((this.policyDetails.tax_amount * 100) / this.policyDetails.sub_total_amount).toFixed(2))

      this.editPolicyForm = this.fb.group({
        // policy details
        first_name: [this.policyDetails.first_name, [Validators.required, this.formValidationSvc.notEmpty]],
        last_name: [this.policyDetails.last_name, [Validators.required, this.formValidationSvc.notEmpty]],
        email: [this.policyDetails.email, [Validators.required, this.formValidationSvc.validEmail]],
        mobile: [this.policyDetails.mobile ? this.commonSvc.setUSFormatPhoneNumber(this.policyDetails.mobile) : null, [Validators.required, this.formValidationSvc.phoneNumberUS]],
        alternate_phone: [this.policyDetails.alternate_phone ? this.commonSvc.setUSFormatPhoneNumber(this.policyDetails.alternate_phone) : null, [this.formValidationSvc.phoneNumberUS]],
        billing_zip: [this.policyDetails.billing_zip, [Validators.required, Validators.minLength(5), this.formValidationSvc.numericOnly]],
        billing_city: [this.policyDetails.billing_city, [Validators.required]],
        billing_state: [this.policyDetails.billing_state, [Validators.required]],
        billing_address1: [this.policyDetails.billing_address1, [Validators.required]],
        plan_id: [this.policyDetails.plan_id, [Validators.required]],
        property_type_id: [this.policyDetails.property_type_id, [Validators.required]],
        plan_terms_id: [this.policyDetails.plan_terms_id, [Validators.required]],
        plan_terms_month: [this.policyDetails?.plan_term_details?.plan_term_month],
        property_size_id: [this.policyDetails.property_size_id, [Validators.required]],
        holding_period: [this.policyDetails.holding_period, [Validators.required]],
        policy_start_date: [this.policyDetails.policy_start_date, [Validators.required]],
        policy_end_date: [this.policyDetails.policy_expiry_date, [Validators.required]],
        expiry_with_bonus: [this.policyDetails.expiry_with_bonus ? new Date(this.policyDetails.expiry_with_bonus) : null, [Validators.required]],
        bonus_month: [this.policyDetails.bonus_month.toString(), [Validators.required]],
        policy_amount: [this.policyDetails.policy_amount, [Validators.required]],
        addon_coverage_amount: [this.policyDetails.addon_coverage_amount, [Validators.required]],
        miscellaneous_charges: [this.policyDetails.miscellaneous_charges, [Validators.required]],
        pcf: ['', [Validators.required]],
        policy_note: [''],
        sub_total_amount: [this.policyDetails.sub_total_amount, [Validators.required]],
        discount_amount: [this.policyDetails.discount_amount,],
        tax_type: [this.policyDetails.tax_type ? this.policyDetails.tax_type.toString() : 0],
        tax_percentage: [taxPercentage, [Validators.required]],
        tax_amount: [this.policyDetails.tax_amount, [Validators.required]],
        total_price: [this.policyDetails.total_price, [Validators.required]],
        net_amount: [this.policyDetails.net_amount, [Validators.required]],
        // payment details
        payment_type: [1], // credit card
        paymentDate: [],

        //BANK payment
        bankAccountHolderName: [''],
        bankAccountNumber: [''],
        routingNumber: [''],
        //CREDIT CARD PAYMENT
        cardHolderName: [''],
        cardNumber: [''],
        cardExpiryDate: [''],
        cvv: [''],
        selectedCardId: [null],
        newOrSavedCard: ['1'],
        //Escrow payment
        cheque_no: [''],
        updatePaymentAmount: ['']
      })
      if (!isSubmit) {
        this.getPlansTermList();
      }
      this.serviceCallFeesList = await this.getScfValue(this.policyDetails?.plan_term_details?.plan_term_month);
      if (this.serviceCallFeesList.length > 0) {
        this.serviceCallFeesList.sort((a: any, b: any) => a.scf_value - b.scf_value);
      }

      this.holdingPeriod = await this.getHoldingPeriod();
      this.changeZip('billing_zip');
      setTimeout(() => {
        this.adjustAddOnYearlyPrice()

        }, 500);
      if (this.policyDetails.policy_product_list.length > 0) {
        setTimeout(() => {
          const addOnCheckboxes = Array.from(document.querySelectorAll('.selectedAddOnItems'));

          addOnCheckboxes.forEach((checkbox: any, index) => {
            // Convert checkbox value to a number
            const productIdToFind = parseInt(checkbox.value, 10);

            // Check if the productIdToFind exists in policyDetails.policy_product_list
            const matchedObject = _.find(this.policyDetails.policy_product_list, { 'product_id': productIdToFind });
            // console.log('matchedValue',matchedObject);
            if (matchedObject) {
              checkbox.checked = true;
              let selectedAddOnItems = _.find(this.addOnProductsList, { 'product_id': matchedObject.product_id })
              this.selectedAddOnItems.push(selectedAddOnItems)
            } else {
              checkbox.checked = false
            }
          });
        }, 200);
      }
   
     // console.log('  this.selectedAddOnItems',  this.selectedAddOnItems);
      
   
      this.cdRef.detectChanges()

      // }, 0);
      setTimeout(() => {
        this.editPolicyForm.patchValue({ pcf: this.policyDetails.pcf })
        // console.log('this.editPolicyForm.value',this.editPolicyForm.value);

        let input: any = document.getElementById("addressBar");
        const autocomplete = new google.maps.places.Autocomplete(input, this.options);
        autocomplete.addListener("place_changed", () => {
          this.editPolicyForm.patchValue({
            billing_address1: input.value,
          })
          const place = autocomplete.getPlace();
          var zipCode = this.getZipCodeFromPlace(place);
          console.log('zipCode', zipCode);

          if (zipCode) {
            this.editPolicyForm.patchValue({
              billing_zip: zipCode,
            })
            this.changeZip('billing_zip');
          } else {
            this.editPolicyForm.patchValue({
              billing_zip: '',
              billing_city: '',
              billing_state: ''
            })
          }
        });

          if (this.f['property_size_id'].value == 0 || this.f['property_size_id'].value == 1) {
            let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
            if (matchedObj) {
              this.minimumOrderPrice = this.f['property_size_id'].value == 0 ? matchedObj.min_price_below_5000_sqft : matchedObj.min_price_above_5000_sqft
            }
          }
      
          
        this.cdRef.detectChanges()
      }, 500);


      this.formValidationSvc.forms()

    }
    this.controlLabels={
      first_name_customer: 'Personal Information: First Name',
      last_name_customer: 'Personal Information: Last Name',
      email_customer: 'Personal Information: Email',
      mobile_customer:'Personal Information: Mobile',
      alternate_phone_customer: 'Personal Information: Alternate Phone',
      zip_customer: 'Personal Information: Zip',
      city_customer: 'Personal Information: City',
      state_customer: 'Personal Information: State',
      address_customer: 'Personal Information: Address',

      // policy details
      first_name: 'Property Address: First Name',
      last_name: 'Property Address: Last Name',
      email: 'Property Address: Email',
      mobile:'Property Address: Mobile',
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
      bonus_month:'Plan Information: Bonus Month',
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
      cheque_no:'Payment Method: Check No',
      realtor_email: 'Payment Method: Realtor Email',
      agent_email: 'Payment Method: Agent Email',
    }
  }
  changePhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'mobile_customer') {
        this.editPolicyForm.controls['mobile_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        this.editPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['mobile_customer'].value));
      } else if (field_name == 'mobile') {
        this.editPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      }
    }

    this.formValidationSvc.forms()
  }



  changeAltPhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'alternate_phone_customer') {
        this.editPolicyForm.controls['alternate_phone_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        this.editPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['alternate_phone_customer'].value));
      } else if (field_name == 'alternate_phone') {
        this.editPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      }
    }

    this.formValidationSvc.forms()

  }
  appliclableTax() {
    if (this.billingZipRes) {
      switch (this.f['tax_type'].value) {
        case '1':
          this.editPolicyForm.controls['tax_percentage'].setValue(AppConfig.newYorkTax);
          break;
        case '2':
          this.editPolicyForm.controls['tax_percentage'].setValue(this.billingZipRes.combined_rate * 100);
          break;
        case '3':
          this.editPolicyForm.controls['tax_percentage'].setValue(0);
          break;

        default:
          this.editPolicyForm.controls['tax_percentage'].setValue(null);
          break;
      }
    } else {
      this.editPolicyForm.controls['tax_percentage'].setValue(null);
    }
    this.taxAmountCalculate()
  }
  async changeZip(field_name: string) {
    let inputValue: any

    inputValue = this.f['billing_zip'].value.replace(/[^0-9]/g, '');
    this.validZipBilling = false;
    this.validZipBillingMessage = '';
    this.editPolicyForm.patchValue({
      billing_zip: inputValue
    });

    this.editPolicyForm.patchValue({
      billing_zip: inputValue
    });
    if (inputValue.length > 4) {

      let response: any = await this.commonSvc.validateZipCode(inputValue);
      if (response.status == 1) {
        if (response.data.is_serviceable == 1 && response.data.active_status == 1) {

          this.validZipBilling = true;
          this.editPolicyForm.controls['billing_state'].setValue(response.data.state);
          this.editPolicyForm.controls['billing_city'].setValue(response.data.city);
          // this.editPolicyForm.controls['tax_percentage'].setValue(response.data.combined_rate);
          this.billingZipRes = response.data


        } else {
          this.validZipBilling = false;
          this.editPolicyForm.controls['billing_state'].setValue(null);
          this.editPolicyForm.controls['billing_city'].setValue(null);
          // this.editPolicyForm.controls['tax_percentage'].setValue(null);
          this.validZipBillingMessage = 'Unavailable services in this zip code';
          this.billingZipRes = null

        }
      } else {
        this.validZipBilling = false;
        this.validZipBillingMessage = response.message;
        this.billingZipRes = null

      }

    } else {

      this.editPolicyForm.controls['billing_state'].setValue(null);
      this.editPolicyForm.controls['billing_city'].setValue(null);
      // this.editPolicyForm.controls['tax_percentage'].setValue(null);
      this.validZipBillingMessage = '';
      this.billingZipRes = null

    }
    setTimeout(() => {
      this.appliclableTax()
    }, 500);
    this.formValidationSvc.forms()
  }

  onInputChange(field_name: any) {
    if (field_name === 'first_name_customer') {
      this.editPolicyForm.controls['first_name'].setValue(this.f['first_name_customer'].value);
    } else if (field_name == 'last_name_customer') {
      this.editPolicyForm.controls['last_name'].setValue(this.f['last_name_customer'].value);
    } else if (field_name == 'email_customer') {
      this.editPolicyForm.controls['email'].setValue(this.f['email_customer'].value);
    } else if (field_name == 'address_customer') {
      this.editPolicyForm.controls['billing_address1'].setValue(this.f['address_customer'].value);
    }
    this.formValidationSvc.forms()
  }
  getPolicyDetails() {
    return new Promise<void>((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.policy.getPolicyDetails}/${this.policyId}`, '').subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (err) => {
          reject(err)
        },
      })
    })
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
  onChangePlan() {
    if (this.f['plan_id'].value != this.policyDetails.plan_id) {
      this.editPolicyForm.controls['property_type_id'].setValue('');
      this.editPolicyForm.controls['plan_terms_id'].setValue('');
      this.editPolicyForm.controls['bonus_month'].setValue(0);
    }
    this.getPlansTermList()
  }

  getPlansTermList() {
    if (this.f['property_type_id'].value && this.f['plan_id'].value) {
      this.apiSvc.get(`${AppConfig.apiUrl.plansterms.getAllPlanTerms}?property_type_id=${this.f['property_type_id'].value}&plan_id=${this.f['plan_id'].value}`).subscribe({
        next: (val: any) => {
          this.planTermList = val?.data;
          this.planTermList.sort((a: any, b: any) => a.plan_term_month - b.plan_term_month);
          this.formValidationSvc.forms();
         // this.getComissionInfo();

        }

      });
    }

    // this.resetCalculation();
  }
  async onChangePlanTermOrPropertySize() {
    // this.resetCalculation()
    if (this.f['property_size_id'].value == 0 || this.f['property_size_id'].value == 1) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj) {
        console.log('matchedObj',matchedObj);
        
        this.editPolicyForm.controls['plan_terms_month'].setValue(matchedObj.plan_term_month);
        this.editPolicyForm.controls['pcf'].setValue(null)
        this.serviceCallFeesList = await this.getScfValue(matchedObj.plan_term_month)
        const endDate = moment(this.f['policy_start_date'].value).add(matchedObj.plan_term_month, 'month').format("YYYY-MM-DD");
        this.editPolicyForm.controls['policy_end_date'].setValue(endDate);
        const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
        this.editPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);

        this.editPolicyForm.controls['policy_amount'].setValue(this.f['property_size_id'].value == 0 ? matchedObj.price_below_5000_sqft : matchedObj.price_above_5000_sqft);
        this.minimumOrderPrice = this.f['property_size_id'].value == 0 ? matchedObj.min_price_below_5000_sqft : matchedObj.min_price_above_5000_sqft
        this.editPolicyForm.controls['sub_total_amount'].setValue(this.f['policy_amount'].value);
        this.bonusMonths = []
        
        for (let i = 0; i < matchedObj.bonus_month; i++) {
          this.bonusMonths.push(i + 1)

        }
        this.adjustAddOnYearlyPrice()
        if (matchedObj.plan_term_month == 1) {
          // if plan term is monthly then escrow payment not showing 
          this.showEscrowOrDoNotCharge = false;
          this.changePaymentTab(1)
          let ccBtn: any = document.getElementsByClassName('cc-btn');
          if (ccBtn && ccBtn?.length > 0) {
            ccBtn[0].click()
          }
        } else {
          this.showEscrowOrDoNotCharge = true;
        }
      }

      // calculate only subtotal price
      setTimeout(() => {
        if (this.f['plan_terms_id']) {
          let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
          this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
          if (matchedObj) {
            if (this.selectedAddOnItems.length > 0) {
              if (matchedObj.plan_term_month > 1) {
                //yearly
                let year = matchedObj.plan_term_month / 12;
                let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
                  return accumulator + (currentValue.yearly_price * year);
                }, 0);
                addOnAmount = parseFloat(addOnAmount).toFixed(2)
                this.editPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);

              } else {
                //Monthly
                let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
                  return accumulator + currentValue.monthly_price;
                }, 0);
                addOnAmount = Number(addOnAmount).toFixed(2);
                this.editPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
              }
            } else {
              this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
            }
          }
        }
      }, 250);

      setTimeout(() => {
        this.calculateSubtotalPrice()
      }, 300);
      this.formValidationSvc.forms()
    }
  }

  onChangeHoldingPeriod() {
    const startDate = moment().add(this.f['holding_period'].value, 'days').format("YYYY-MM-DD");
    if (startDate) {
      this.editPolicyForm.controls['policy_start_date'].setValue(startDate);
    }
    if (this.f['property_size_id'].value == 0 || this.f['property_size_id'].value == 1) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj) {
        const endDate = moment(this.f['policy_start_date'].value).add(matchedObj.plan_term_month, 'month').format("YYYY-MM-DD");
        this.editPolicyForm.controls['policy_end_date'].setValue(endDate);
        const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
        this.editPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);
        this.editPolicyForm.controls['policy_amount'].setValue(this.f['property_size_id'].value == 0 ? matchedObj.price_below_5000_sqft : matchedObj.price_above_5000_sqft);
        this.editPolicyForm.controls['sub_total_amount'].setValue(this.f['policy_amount'].value)
      }
      this.calculateSubtotalPrice()
      this.formValidationSvc.forms()
    }
    this.formValidationSvc.forms()

  }
  getAddOnProductList() {
    this.apiSvc.get(`${AppConfig.apiUrl.products.getAllProducts}?active_status=1&product_type=0`).subscribe({
      next: (val: any) => {
        // this.addOnProductsList = [...val?.data];
        // this.constrantAddOnProductsList = [...val?.data];

        val?.data.forEach((obj: any) => {
          obj.update_yearly_price = obj.yearly_price
          this.addOnProductsList.push(obj)
          this.constrantAddOnProductsList.push(obj)
        });
      }
    });
  }
  adjustAddOnYearlyPrice() {
    if (this.f['plan_terms_id']) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj && this.addOnProductsList.length > 0 && matchedObj.plan_term_month >= 12) {
        this.addOnProductsList = [...this.constrantAddOnProductsList]
        let year = matchedObj.plan_term_month / 12;
        this.addOnProductsList.map((product: any) => {

          product.update_yearly_price = product.yearly_price * year
        });
      } else {
        this.addOnProductsList = [...this.constrantAddOnProductsList]
      }
    }
  }
  onChangeAddOnItem(e: any, item: any) {
    if (e.target.checked) {
      this.selectedAddOnItems.push({ product_id: item.product_id, product_name: item.product_name, monthly_price: item.monthly_price, yearly_price: item.yearly_price ,update_yearly_price:item.update_yearly_price})
    } else {
      this.selectedAddOnItems = this.selectedAddOnItems.filter((obj: any) => obj.product_id !== item.product_id);
    }
    if (this.f['plan_terms_id']) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
      if (matchedObj) {
        if (this.selectedAddOnItems.length > 0) {
          if (matchedObj.plan_term_month > 1) {
            //yearly
            let year = matchedObj.plan_term_month / 12;
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.update_yearly_price;
            }, 0);
            addOnAmount = parseFloat(addOnAmount).toFixed(2)
            this.editPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);

          } else {
            //Monthly
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.monthly_price;
            }, 0);
            addOnAmount = Number(addOnAmount).toFixed(2);
            this.editPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
          }
        } else {
          this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
        }
      }
    }
    this.calculateSubtotalPrice()
  }

  taxAmountCalculate() {
    this.editPolicyForm.controls['tax_amount'].setValue(0)
    if ((this.f['tax_percentage'].value == 0 || this.f['tax_percentage'].value) && this.f['sub_total_amount'].value) {
      const miscellaneousCharges = Number(this.f['miscellaneous_charges'].value);
      const sub_total_amount = parseFloat(this.f['sub_total_amount'].value)
      const discountAmount = Number(this.f['discount_amount'].value);
      const afterDiscountAmount = Number(sub_total_amount) - discountAmount
      let taxPrice: any = (sub_total_amount * (this.f['tax_percentage'].value / 100)) //this.f['tax_amount'].value//
      this.editPolicyForm.controls['tax_amount'].setValue(parseFloat(taxPrice).toFixed(2));
      this.editPolicyForm.controls['total_price'].setValue((afterDiscountAmount + taxPrice + miscellaneousCharges).toFixed(2));
      this.editPolicyForm.controls['net_amount'].setValue((afterDiscountAmount + taxPrice + miscellaneousCharges).toFixed(2));
      if (this.f['net_amount'].value > this.policyDetails.net_amount) {
        let updatePayment = (this.f['net_amount'].value - this.policyDetails.net_amount).toFixed(2)
        this.editPolicyForm.controls['updatePaymentAmount'].setValue(parseFloat(updatePayment));
      } else {
        this.editPolicyForm.controls['updatePaymentAmount'].setValue('');
      }

      this.showPaymentOption()
     // this.getComissionInfo()
    };

  }
  showPaymentOption() {
    if (this.f['net_amount'].value > this.policyDetails.net_amount) {
      this.showPayment = true;
      this.editPolicyForm.controls['paymentDate'].setValue(new Date())
      this.editPolicyForm.controls['paymentDate'].setValidators([Validators.required,]);
      this.editPolicyForm.controls['paymentDate'].updateValueAndValidity();
      this.editPolicyForm.controls['payment_type'].setValue(1);


      if (this.policyDetails?.customer_details.card_list.length > 0) {
        let selctedCardDetails = this.policyDetails?.customer_details.card_list.filter((o: any) => o.primary_card == true)[0];
        if (selctedCardDetails) {
          this.editPolicyForm.controls['cvv'].clearValidators();
          this.editPolicyForm.controls['cvv'].updateValueAndValidity();
          this.editPolicyForm.controls['payment_type'].setValue(1);
          this.editPolicyForm.controls['cardNumber'].clearValidators();
          this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
          this.editPolicyForm.controls['newOrSavedCard'].setValue('2');
          this.editPolicyForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
          this.editPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
          this.editPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
          let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
          this.editPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
          this.cardImageShow(selctedCardDetails.card_type)

        }
      } else {
        this.editPolicyForm.controls['newOrSavedCard'].setValue('1');

        this.editPolicyForm.controls['cardExpiryDate'].setValidators([Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]);
        this.editPolicyForm.controls['cardHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
        this.editPolicyForm.controls['cvv'].setValidators([Validators.required]);
        this.editPolicyForm.controls['cardNumber'].setValidators([Validators.required,]);
        this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.editPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
        this.editPolicyForm.controls['cvv'].updateValueAndValidity();
        this.editPolicyForm.controls['cardHolderName'].updateValueAndValidity();
      }
    } else {
      this.showPayment = false;
      this.editPolicyForm.controls['newOrSavedCard'].setValue('1');
      this.editPolicyForm.controls['bankAccountHolderName'].setValue(null);
      this.editPolicyForm.controls['bankAccountNumber'].setValue(null);
      this.editPolicyForm.controls['routingNumber'].setValue(null);
      this.editPolicyForm.controls['bankAccountHolderName'].clearValidators();
      this.editPolicyForm.controls['bankAccountNumber'].clearValidators();
      this.editPolicyForm.controls['routingNumber'].clearValidators();
      this.editPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.editPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['routingNumber'].updateValueAndValidity();

      this.editPolicyForm.controls['payment_type'].setValue(null)
      this.editPolicyForm.controls['cardNumber'].setValue(null);
      this.editPolicyForm.controls['cardExpiryDate'].setValue(null);
      this.editPolicyForm.controls['paymentDate'].setValue(null);
      this.editPolicyForm.controls['cardHolderName'].setValue(null);
      this.editPolicyForm.controls['cvv'].setValue(null);

      this.editPolicyForm.controls['cardNumber'].clearValidators();
      this.editPolicyForm.controls['cardExpiryDate'].clearValidators();
      this.editPolicyForm.controls['paymentDate'].clearValidators();
      this.editPolicyForm.controls['cardHolderName'].clearValidators();
      this.editPolicyForm.controls['cvv'].clearValidators();
      this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cvv'].updateValueAndValidity();
      this.editPolicyForm.controls['paymentDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cardHolderName'].updateValueAndValidity();
    }
    this.formValidationSvc.forms();

    setTimeout(() => {

      this.formValidationSvc.forms();
    }, 500);
  }
  calculateSubtotalPrice() {
    if (this.f['plan_terms_id']) {
      /* let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
       //this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
        if (matchedObj) {
         if (this.selectedAddOnItems.length > 0) {
           if (matchedObj.plan_term_month > 1) {
             //yearly
             let year = matchedObj.plan_term_month / 12;
             let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
               return accumulator + (currentValue.yearly_price * year);
             }, 0);
             addOnAmount = parseFloat(addOnAmount).toFixed(2)
             this.editPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);
 
           } else {
             //Monthly
             let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
               return accumulator + currentValue.monthly_price;
             }, 0);
             addOnAmount = Number(addOnAmount).toFixed(2);
             this.editPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
           }
         } else {
           this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
         }
       } */
      // Calculate Subtotal
      if (this.f['policy_amount'].value) {
        if (this.f['addon_coverage_amount'].value) {
          const policyAmount = Number(this.f['policy_amount'].value);
          const addonCoverageAmount = Number(this.f['addon_coverage_amount'].value);

          let sub_total_amount = policyAmount + addonCoverageAmount;
          this.editPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount.toFixed(2));
          this.editPolicyForm.controls['total_price'].setValue(sub_total_amount.toFixed(2));
          this.editPolicyForm.controls['net_amount'].setValue(sub_total_amount.toFixed(2));
        } else {
          let sub_total_amount = parseFloat(this.f['policy_amount'].value).toFixed(2)
          this.editPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount)
          this.editPolicyForm.controls['total_price'].setValue(sub_total_amount)
          this.editPolicyForm.controls['net_amount'].setValue(sub_total_amount)
        }
      }
      if (this.selectedAddOnItems.length == 0) {
        this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
      }

      this.taxAmountCalculate()
    }
    this.formValidationSvc.forms()

  }
  resetCalculation() {
    this.editPolicyForm.controls['holding_period'].setValue(30)
    this.editPolicyForm.controls['policy_start_date'].setValue(moment().add(30, 'days').format("YYYY-MM-DD"));
    this.editPolicyForm.controls['policy_end_date'].setValue(null)
    this.editPolicyForm.controls['expiry_with_bonus'].setValue(null)
    this.editPolicyForm.controls['policy_amount'].setValue(0)
    this.selectedAddOnItems = []
    this.editPolicyForm.controls['addon_coverage_amount'].setValue(0)
    this.editPolicyForm.controls['sub_total_amount'].setValue(0)
    // this.editPolicyForm.controls['tax_percentage'].setValue(0)
    this.editPolicyForm.controls['tax_amount'].setValue(0)
    this.editPolicyForm.controls['total_price'].setValue(0)
    this.editPolicyForm.controls['net_amount'].setValue(0)
    this.relaventCommission = null
    const addOnCheckboxes: any = Array.from(document.querySelectorAll(`.selectedAddOnItems`));
    addOnCheckboxes.forEach((checkbox: any, index: number) => { checkbox.checked = false; });
    this.submitted = false
  }

  getComissionInfo() {

    if (this.f['plan_terms_id'].value && this.f['sub_total_amount'].value) {
      if (this.f['sub_total_amount'].value > this.policyDetails.sub_total_amount) {

        let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
        if (matchedObj) {
          let payload = {
            policy_term_months: matchedObj.plan_term_month,
            subtotal_amount: parseFloat(Number(this.f['sub_total_amount'].value - this.policyDetails.sub_total_amount).toFixed(2))

          }
          // Listen for changes in sub_total_amount control value

          this.apiSvc.post(AppConfig.apiUrl.commissions.getRelaventCommission, payload).pipe(
            debounceTime(500)).subscribe({
              next: (response: any) => {
                if (response.status = 1) {
                  this.relaventCommission = response.data;
                  // console.log(this.relaventCommission);

                } else {
                  this.relaventCommission = null
                  this.alertService.warning(response.message)
                }
              },
            })
        }
      }
    }
  }
  onChangeBonusMonth() {
    const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
    this.editPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);

  };

  /* changePaymentTab(payment_type: any) {
    if (payment_type == 1) {
      // Credit Card Payment
      this.editPolicyForm.controls['payment_type'].setValue(payment_type);
      this.editPolicyForm.controls['bankAccountHolderName'].setValue(null);
      this.editPolicyForm.controls['bankAccountNumber'].setValue(null);
      this.editPolicyForm.controls['routingNumber'].setValue(null);
      this.editPolicyForm.controls['bankAccountHolderName'].clearValidators();
      this.editPolicyForm.controls['bankAccountNumber'].clearValidators();
      this.editPolicyForm.controls['routingNumber'].clearValidators();
      this.editPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.editPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['routingNumber'].updateValueAndValidity();
      this.showPaymentOption()
      //set validator
      if (this.f['newOrSavedCard'].value == 2) {
        this.editPolicyForm.controls['cardNumber'].clearValidators();
      } else {
        this.editPolicyForm.controls['cardNumber'].setValidators([Validators.required,]);
      }
      this.editPolicyForm.controls['cardExpiryDate'].setValidators([Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]);
      this.editPolicyForm.controls['cardHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.editPolicyForm.controls['cvv'].setValidators([Validators.required]);
      this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cvv'].updateValueAndValidity();
      this.editPolicyForm.controls['cardHolderName'].updateValueAndValidity();
    } else if (payment_type == 2) {
      // Bank  Payment
      this.editPolicyForm.controls['selectedCardId'].setValue(null)
      this.editPolicyForm.controls['payment_type'].setValue(payment_type)
      this.editPolicyForm.controls['cardNumber'].setValue(null);
      this.editPolicyForm.controls['cardExpiryDate'].setValue(null);
      this.editPolicyForm.controls['paymentDate'].setValue(null);
      this.editPolicyForm.controls['cardHolderName'].setValue(null);
      this.editPolicyForm.controls['cvv'].setValue(null);

      this.editPolicyForm.controls['cardNumber'].clearValidators();
      this.editPolicyForm.controls['cardExpiryDate'].clearValidators();
      // this.editPolicyForm.controls['paymentDate'].clearValidators();
      this.editPolicyForm.controls['cardHolderName'].clearValidators();
      this.editPolicyForm.controls['cvv'].clearValidators();
      this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cvv'].updateValueAndValidity();
      // this.editPolicyForm.controls['paymentDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cardHolderName'].updateValueAndValidity();
      // set validator
      this.editPolicyForm.controls['bankAccountHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.editPolicyForm.controls['bankAccountNumber'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.editPolicyForm.controls['routingNumber'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.editPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.editPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['routingNumber'].updateValueAndValidity();
    } else {
      this.editPolicyForm.controls['bankAccountHolderName'].clearValidators();
      this.editPolicyForm.controls['bankAccountNumber'].clearValidators();
      this.editPolicyForm.controls['routingNumber'].clearValidators();
      this.editPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.editPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['routingNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['cardNumber'].clearValidators();
      this.editPolicyForm.controls['cardExpiryDate'].clearValidators();
      this.editPolicyForm.controls['cvv'].clearValidators();
      this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cvv'].updateValueAndValidity();
      this.editPolicyForm.controls['payment_type'].setValue(payment_type)
    }
    this.formValidationSvc.forms();

  } */
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
        this.editPolicyForm.controls['paymentDate'].setValue(new Date());
        if (this.policyDetails?.customer_details?.card_list?.length > 0) {
          this.editPolicyForm.controls['newOrSavedCard'].setValue('2');
          if (this.f['newOrSavedCard'].value == 2) {

            this.editPolicyForm.controls['cardNumber'].clearValidators();
          } else {
            this.setValidators('cardNumber', [Validators.required]);
          }
          this.onChangeNewOrSavedCard()
        }
        let creditCard: any = document.getElementById('creditCard');
        if (creditCard) {
          creditCard.checked = true
        }
        break;

      case 2: // Bank Payment
        this.clearPreviousTabValues();
        this.clearCreditCardValidators();
        this.setValidators('paymentDate', [Validators.required]);
        this.setValidators('bankAccountHolderName', [Validators.required]);
        this.setValidators('bankAccountNumber', [Validators.required]);
        this.setValidators('routingNumber', [Validators.required]);
        break;

      case 3: // Escrow Payment
        this.clearPreviousTabValues();
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.editPolicyForm.controls['paymentDate'].clearValidators();
        this.editPolicyForm.controls['paymentDate'].updateValueAndValidity();
        break;
      case 4: // Do not charge Payment
        this.clearPreviousTabValues();
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.editPolicyForm.controls['paymentDate'].clearValidators();
        this.editPolicyForm.controls['paymentDate'].updateValueAndValidity();
        break;
      default:
        this.clearBankValidators();
        this.clearCreditCardValidators();
        break;
    }
    this.editPolicyForm.controls['payment_type'].setValue(payment_type);

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
      'newOrSavedCard'
    ];

    controlsToClear.forEach(controlName => {
      this.editPolicyForm.get(controlName)?.setValue(null);
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
    const control = this.editPolicyForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  clearValidators(controlName: string) {
    const control = this.editPolicyForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  onSubmit() {
    this.submitted = true;
    //console.log(this.editPolicyForm);
    if (this.editPolicyForm.valid && this.validZipBilling && this.f['net_amount'].value > 0) {
      if (this.f['net_amount'].value < this.minimumOrderPrice) {
        this.alertService.warning(`The Total amount should not be less than $${this.minimumOrderPrice.toFixed(2)}`)
        return
      }
      let formValue: any = { ...this.editPolicyForm.value };
      formValue.mobile = this.commonSvc.convertToNormalPhoneNumber(formValue.mobile);
      formValue.alternate_phone = this.commonSvc.convertToNormalPhoneNumber(formValue.alternate_phone);
      formValue.cardExpiryDate = formValue.payment_type == 1 ? formValue.cardExpiryDate.replace(/\//g, '') : null;
      formValue.cardNumber = formValue.cardNumber ? formValue.cardNumber.replace(/\s+/g, '') : null
      formValue.paymentDate = moment(formValue.paymentDate).isValid() ? moment(formValue.paymentDate).format('YYYY-MM-DD') : null
      let commission_value = 0
      if (this.relaventCommission) {
        if (this.relaventCommission.price_percentage == 1) {
          commission_value = parseFloat((this.f['sub_total_amount'].value * this.relaventCommission.commission_value / 100).toFixed(2))
        } else {
          commission_value = parseFloat(this.relaventCommission.commission_value.toFixed(2))
        }
      }
      let payload = {

        ...formValue,
        selectedAddOnItems: this.selectedAddOnItems,
       // commission_value: commission_value ? commission_value : 0,
        commission_type: 1
      }
      // console.log('payload', payload);

      this.loading = true;
      this.apiSvc.put(`${AppConfig.apiUrl.policy.updatePolicy}/${this.policyId}`, payload).subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            this.loading = false;
            // this.getPlansTermList();
            this.editPolicyForm.reset();
            this.relaventCommission = null
            this.alertService.success(res.message);
            this.submitted = false;
            this.showPayment = false;
            this.selectedAddOnItems = []

            setTimeout(() => {
              this.declareEditPolicyForm(true);
            }, 1600);

          } else {
            this.loading = false;
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });

    } else {
      this.logInvalidControls(this.editPolicyForm);
    //  this.alertService.error(`One or more mandatory fields are still blank. Please fill up all the mandatory fields to proceed. `)
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.editPolicyForm);
    }
  }
  changePaymentDate(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }


  onChangeNewOrSavedCard() {
    if (this.f['newOrSavedCard'].value == 2) {
      let selctedCardDetails = this.policyDetails.customer_details?.card_list.filter((o: any) => o.primary_card == true)[0];
      if (selctedCardDetails) {
        this.cardImageShow(selctedCardDetails.card_type)
        this.editPolicyForm.controls['payment_type'].setValue(1);
        this.editPolicyForm.controls['cardNumber'].clearValidators();
        this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.editPolicyForm.controls['cvv'].clearValidators();
        this.editPolicyForm.controls['cvv'].updateValueAndValidity();
        this.editPolicyForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
        this.editPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.editPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.editPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }

    } else {
      this.editPolicyForm.controls['payment_type'].setValue(1);
      this.editPolicyForm.controls['cardExpiryDate'].setValidators([Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]);
      this.editPolicyForm.controls['cardHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.editPolicyForm.controls['cardNumber'].setValidators([Validators.required]);
      this.editPolicyForm.controls['cvv'].setValidators([Validators.required, this.formValidationSvc.validateCVV]);
      this.editPolicyForm.controls['cvv'].updateValueAndValidity();
      this.editPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.editPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.editPolicyForm.controls['cardHolderName'].updateValueAndValidity();
      this.editPolicyForm.controls['selectedCardId'].setValue(null);
      this.editPolicyForm.controls['cardNumber'].setValue(null);
      this.editPolicyForm.controls['cardExpiryDate'].setValue(null);
      this.editPolicyForm.controls['cardHolderName'].setValue(null);
      this.editPolicyForm.controls['cvv'].setValue(null);
      this.editPolicyForm.controls['paymentDate'].setValue(new Date());

    }

    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);
  }
  onChangecard() {
    if (this.f['selectedCardId'].value) {
      let customer_card_id = this.f['selectedCardId'].value;
      let selctedCardDetails = this.policyDetails?.customer_details?.card_list.filter((o: any) => o.customer_card_id == customer_card_id)[0];
      this.cardImageShow(selctedCardDetails.card_type)
      if (selctedCardDetails) {
        this.editPolicyForm.controls['payment_type'].setValue(1);
        this.editPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.editPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.editPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }
    }
  }
  ngOnDestroy() {
    const layoutPageContent: any = document.getElementsByClassName('layout-page-content');
    if (layoutPageContent) {
      layoutPageContent[0].classList.remove('policy-page-content')
    }
  }

  cardImageShow(cardType: any) {
    switch (cardType) {
      case 'Visa':
        this.imgSrc = 'assets/img/allCardIcon/visa.svg';
        break;
      case 'MasterCard':
        this.imgSrc = 'assets/img/allCardIcon/mastercard.svg';
        break;
      case 'AmericanExpress':
        this.imgSrc = 'assets/img/allCardIcon/amex.svg';
        break;
      case 'Discover':
        this.imgSrc = 'assets/img/allCardIcon/discover.svg';
        break;
      case 'DinersClub':
        this.imgSrc = 'assets/img/allCardIcon/diners.svg';
        break;
      case 'JCB':
        this.imgSrc = 'assets/img/allCardIcon/jcb.svg';
        break;
      // Add cases for other card types as needed
      default:
        this.imgSrc = 'assets/img/allCardIcon/credit-card.svg'; // Set a default image for unknown card types
    }
  }
  getScfValue(month: any) {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.serviceCallFees.getAllServiceCallfees}?month=${month}`).subscribe({
        next: (res: any) => {
          resolve(res.data);
        },
        error: () => { },
        complete: () => { }
      });
    });


    // this.apiSvc.get(`${AppConfig.apiUrl.serviceCallFees.getAllServiceCallfees}?month=${month}`).subscribe({
    //   next: (res: any) => {
    //     this.serviceCallFeesList = res.data
    //   },
    //   error: () => { },
    //   complete: () => { }
    // });
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
 if ( this.f['net_amount'].value <= 0) {
   errorMessage += 'Net amount must be greater than 0. ';
 }

 // Display error message if any condition is not met
 if (!this.editPolicyForm.valid) {
   for (const field in formGroup.controls) {
     const control:any = formGroup.get(field);
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
 }else if(errorMessage) {
   this.alertService.error(errorMessage);
 }
}

  getHoldingPeriod() {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.holding.getAllHoldingPeriod}?active_status=1`).subscribe({
        next: (res: any) => {
          resolve(res.data);
        },
        error: () => { },
        complete: () => { }
      });
    });
  }
}
