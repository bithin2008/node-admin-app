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
  selector: 'app-renew-policy',
  templateUrl: './renew-policy.component.html',
  styleUrls: ['./renew-policy.component.scss']
})
export class RenewPolicyComponent {
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
  public renewPolicyForm: FormGroup | any
  public showEscrowOrDoNotCharge = true
  public isDisabled = false
  public minimumOrderPrice = 0
  public options = {
    types: ["address"],
    componentRestrictions: {
      country: 'us'
    }
  };
  imgSrc: any = 'assets/img/allCardIcon/credit-card.svg';
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
    this.commonSvc.setTitle('Renew Policy');
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
  ngOnInit() {
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
      this.declarerenewPolicyForm(false);
    }
    this.formValidationSvc.forms()
  }

  get f() { return this.renewPolicyForm.controls; }

  async declarerenewPolicyForm(isSubmit: boolean) {
    const response: any = await this.getPolicyDetails();
    if (response.status == 1) {
      this.policyDetails = response.data
      // console.log(this.policyDetails);
      if (this.policyDetails?.plan_term_details?.plan_term_month == 1) {
        this.showEscrowOrDoNotCharge = false;
      }
      this.getScfValue(this.policyDetails?.plan_term_details?.plan_term_month)
      let taxPercentage = parseFloat(((this.policyDetails.tax_amount * 100) / this.policyDetails.sub_total_amount).toFixed(2))
      // setTimeout(() => {


      this.renewPolicyForm = this.fb.group({
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
        bonus_month: [JSON.stringify(this.policyDetails.bonus_month), [Validators.required]],
        policy_amount: [this.policyDetails.policy_amount, [Validators.required]],
        addon_coverage_amount: [this.policyDetails.addon_coverage_amount, [Validators.required]],
        miscellaneous_charges: [this.policyDetails.miscellaneous_charges, [Validators.required]],
        pcf: ['', [Validators.required]],
        policy_note: [''],
        sub_total_amount: [this.policyDetails.sub_total_amount, [Validators.required]],
        discount_amount: [this.policyDetails.discount_amount,],
        tax_percentage: [taxPercentage, [Validators.required]],
        tax_amount: [this.policyDetails.tax_amount, [Validators.required]],
        total_price: [this.policyDetails.total_price, [Validators.required]],
        net_amount: [this.policyDetails.net_amount, [Validators.required]],
        // payment details
        payment_type: ['1'], // credit card
        paymentDate: [new Date()],

        //BANK payment
        bankAccountHolderName: [''],
        bankAccountNumber: [''],
        routingNumber: [''],
        //CREDIT CARD PAYMENT
        cardHolderName: ['', [Validators.required]],
        cardNumber: ['', [Validators.required]],
        cardExpiryDate: ['', [Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]],
        cvv: ['', [Validators.required, this.formValidationSvc.validateCVV]],
        selectedCardId: [null],
        newOrSavedCard: ['1'],
        //Escrow payment
        cheque_no: [''],
        updatePaymentAmount: ['']
      })
      this.serviceCallFeesList = this.getScfValue(this.policyDetails?.plan_term_details?.plan_term_month);
      this.changeZip('billing_zip');
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
      if (!isSubmit) {
        this.getPlansTermList();
      }
      this.cdRef.detectChanges()

      // }, 0);
      setTimeout(() => {
        this.renewPolicyForm.patchValue({ pcf: this.policyDetails.pcf })
        // console.log('this.renewPolicyForm.value',this.renewPolicyForm.value);
        let input: any = document.getElementById("addressBar");
        const autocomplete = new google.maps.places.Autocomplete(input, this.options);
        autocomplete.addListener("place_changed", () => {
          this.renewPolicyForm.patchValue({
            billing_address1: input.value,
          })
          const place = autocomplete.getPlace();
          var zipCode = this.getZipCodeFromPlace(place);
          console.log('zipCode', zipCode);

          if (zipCode) {
            this.renewPolicyForm.patchValue({
              billing_zip: zipCode,
            })
            this.changeZip('billing_zip');
          } else {
            this.renewPolicyForm.patchValue({
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
        this.adjustAddOnYearlyPrice()

        this.cdRef.detectChanges()

      }, 500);


    }
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

  changePhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'mobile_customer') {
        this.renewPolicyForm.controls['mobile_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        this.renewPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['mobile_customer'].value));
      } else if (field_name == 'mobile') {
        this.renewPolicyForm.controls['mobile'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      }
    }

    this.formValidationSvc.forms()
  }



  changeAltPhoneFormat(field_name: any) {
    if (this.f[field_name].value) {
      if (field_name == 'alternate_phone_customer') {
        this.renewPolicyForm.controls['alternate_phone_customer'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
        this.renewPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f['alternate_phone_customer'].value));
      } else if (field_name == 'alternate_phone') {
        this.renewPolicyForm.controls['alternate_phone'].setValue(this.commonSvc.setUSFormatPhoneNumber(this.f[field_name].value));
      }
    }

    this.formValidationSvc.forms()

  }
  async changeZip(field_name: string) {
    let inputValue: any

    inputValue = this.f['billing_zip'].value.replace(/[^0-9]/g, '');
    this.validZipBilling = false;
    this.validZipBillingMessage = '';
    this.renewPolicyForm.patchValue({
      billing_zip: inputValue
    });

    this.renewPolicyForm.patchValue({
      billing_zip: inputValue
    });
    if (inputValue.length > 4) {

      let response: any = await this.commonSvc.validateZipCode(inputValue);
      if (response.status == 1) {
        if (response.data.is_serviceable == 1 && response.data.active_status == 1) {

          this.validZipBilling = true;
          this.renewPolicyForm.controls['billing_state'].setValue(response.data.state);
          this.renewPolicyForm.controls['billing_city'].setValue(response.data.city);

        } else {
          this.validZipBilling = false;
          this.renewPolicyForm.controls['billing_state'].setValue(null);
          this.renewPolicyForm.controls['billing_city'].setValue(null);
          this.validZipBillingMessage = 'Unavailable services in this zip code';

        }
      } else {
        this.validZipBilling = false;
        this.validZipBillingMessage = response.message;;
      }

    } else {

      this.renewPolicyForm.controls['billing_state'].setValue(null);
      this.renewPolicyForm.controls['billing_city'].setValue(null);
      this.validZipBillingMessage = '';

    }
    this.formValidationSvc.forms()
  }

  onInputChange(field_name: any) {
    if (field_name === 'first_name_customer') {
      this.renewPolicyForm.controls['first_name'].setValue(this.f['first_name_customer'].value);
    } else if (field_name == 'last_name_customer') {
      this.renewPolicyForm.controls['last_name'].setValue(this.f['last_name_customer'].value);
    } else if (field_name == 'email_customer') {
      this.renewPolicyForm.controls['email'].setValue(this.f['email_customer'].value);
    } else if (field_name == 'address_customer') {
      this.renewPolicyForm.controls['billing_address1'].setValue(this.f['address_customer'].value);
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
      this.renewPolicyForm.controls['property_type_id'].setValue('');
      this.renewPolicyForm.controls['plan_terms_id'].setValue('');
      this.renewPolicyForm.controls['bonus_month'].setValue(0);
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
          this.getComissionInfo();

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
        this.renewPolicyForm.controls['plan_terms_month'].setValue(matchedObj.plan_term_month);
        this.renewPolicyForm.controls['pcf'].setValue(null)
        this.serviceCallFeesList = await this.getScfValue(matchedObj.plan_term_month)
        const endDate = moment(this.f['policy_start_date'].value).add(matchedObj.plan_term_month, 'month').format("YYYY-MM-DD");
        this.renewPolicyForm.controls['policy_end_date'].setValue(endDate);
        const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
        this.renewPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);

        this.renewPolicyForm.controls['policy_amount'].setValue(this.f['property_size_id'].value == 0 ? matchedObj.price_below_5000_sqft : matchedObj.price_above_5000_sqft);
        this.minimumOrderPrice = this.f['property_size_id'].value == 0 ? matchedObj.min_price_below_5000_sqft : matchedObj.min_price_above_5000_sqft
        this.renewPolicyForm.controls['sub_total_amount'].setValue(this.f['policy_amount'].value);
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
          this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
          if (matchedObj) {
            if (this.selectedAddOnItems.length > 0) {
              if (matchedObj.plan_term_month > 1) {
                //yearly
                let year = matchedObj.plan_term_month / 12;
                let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
                  return accumulator + (currentValue.yearly_price * year);
                }, 0);
                addOnAmount = parseFloat(addOnAmount).toFixed(2)
                this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);

              } else {
                //Monthly
                let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
                  return accumulator + currentValue.monthly_price;
                }, 0);
                addOnAmount = Number(addOnAmount).toFixed(2);
                this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
              }
            } else {
              this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
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
      this.renewPolicyForm.controls['policy_start_date'].setValue(startDate);
    }
    if (this.f['property_size_id'].value == 0 || this.f['property_size_id'].value == 1) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      if (matchedObj) {
        const endDate = moment(this.f['policy_start_date'].value).add(matchedObj.plan_term_month, 'month').format("YYYY-MM-DD");
        this.renewPolicyForm.controls['policy_end_date'].setValue(endDate);
        const endWithBonusDate = moment(this.f['policy_end_date'].value).add(this.f['bonus_month'].value, 'month').format("YYYY-MM-DD");
        this.renewPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);
        this.renewPolicyForm.controls['policy_amount'].setValue(this.f['property_size_id'].value == 0 ? matchedObj.price_below_5000_sqft : matchedObj.price_above_5000_sqft);
        this.renewPolicyForm.controls['sub_total_amount'].setValue(this.f['policy_amount'].value)
      }
      this.calculateAddOnSubtotalPrice()
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
      this.selectedAddOnItems.push({ product_id: item.product_id, product_name: item.product_name, monthly_price: item.monthly_price, yearly_price: item.update_yearly_price })
    } else {
      this.selectedAddOnItems = this.selectedAddOnItems.filter((obj: any) => obj.product_id !== item.product_id);
    }
    if (this.f['plan_terms_id']) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
      if (matchedObj) {
        if (this.selectedAddOnItems.length > 0) {
          if (matchedObj.plan_term_month > 1) {
            //yearly
            let year = matchedObj.plan_term_month / 12;
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.yearly_price;
            }, 0);
            addOnAmount = parseFloat(addOnAmount).toFixed(2)
            this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);

          } else {
            //Monthly
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.monthly_price;
            }, 0);
            addOnAmount = Number(addOnAmount).toFixed(2);
            this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
          }
        } else {
          this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
        }
      }
    }
    this.calculateAddOnSubtotalPrice()
  }

  taxAmountCalculate() {

    if ((this.f['tax_percentage'].value == 0 || this.f['tax_percentage'].value) && this.f['sub_total_amount'].value) {
      const miscellaneousCharges = Number(this.f['miscellaneous_charges'].value);
      const sub_total_amount = parseFloat(this.f['sub_total_amount'].value)
      const discountAmount = Number(this.f['discount_amount'].value);
      const afterDiscountAmount = Number(sub_total_amount) - discountAmount
      let taxPrice: any = this.f['tax_amount'].value//(sub_total_amount * (this.f['tax_percentage'].value / 100))
      // this.renewPolicyForm.controls['tax_amount'].setValue(parseFloat(taxPrice).toFixed(2));
      this.renewPolicyForm.controls['total_price'].setValue((afterDiscountAmount + taxPrice + miscellaneousCharges).toFixed(2));
      let updatePayment = (this.f['net_amount'].value - this.policyDetails.net_amount)
      this.renewPolicyForm.controls['updatePaymentAmount'].setValue(parseFloat((updatePayment).toFixed(2)));
      this.renewPolicyForm.controls['net_amount'].setValue((afterDiscountAmount + taxPrice + miscellaneousCharges).toFixed(2));

      // this.showPaymentOption()
      this.getComissionInfo()
    };

  }
  // showPaymentOption() {
  //     this.renewPolicyForm.controls['payment_type'].setValue('1')
  //     this.renewPolicyForm.controls['newOrSavedCard'].setValue('1');
  //     this.renewPolicyForm.controls['bankAccountHolderName'].setValue(null);
  //     this.renewPolicyForm.controls['bankAccountNumber'].setValue(null);
  //     this.renewPolicyForm.controls['routingNumber'].setValue(null);
  //     this.renewPolicyForm.controls['bankAccountHolderName'].clearValidators();
  //     this.renewPolicyForm.controls['bankAccountNumber'].clearValidators();
  //     this.renewPolicyForm.controls['routingNumber'].clearValidators();
  //     this.renewPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
  //     this.renewPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
  //     this.renewPolicyForm.controls['routingNumber'].updateValueAndValidity();

  //     this.renewPolicyForm.controls['payment_type'].setValue(null)
  //     this.renewPolicyForm.controls['cardNumber'].setValue(null);
  //     this.renewPolicyForm.controls['cardExpiryDate'].setValue(null);
  //     this.renewPolicyForm.controls['paymentDate'].setValue(null);
  //     this.renewPolicyForm.controls['cardHolderName'].setValue(null);
  //     this.renewPolicyForm.controls['cvv'].setValue(null);

  //     this.renewPolicyForm.controls['cardNumber'].clearValidators();
  //     this.renewPolicyForm.controls['cardExpiryDate'].clearValidators();
  //     this.renewPolicyForm.controls['paymentDate'].clearValidators();
  //     this.renewPolicyForm.controls['cardHolderName'].clearValidators();
  //     this.renewPolicyForm.controls['cvv'].clearValidators();
  //     this.renewPolicyForm.controls['cardNumber'].updateValueAndValidity();
  //     this.renewPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
  //     this.renewPolicyForm.controls['cvv'].updateValueAndValidity();
  //     this.renewPolicyForm.controls['paymentDate'].updateValueAndValidity();
  //     this.renewPolicyForm.controls['cardHolderName'].updateValueAndValidity();


  //   setTimeout(() => {

  //     this.formValidationSvc.forms();
  //   }, 500);
  // }

  calculateSubtotalPrice() {
    if (this.f['plan_terms_id']) {
      /* let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
       //this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
        if (matchedObj) {
         if (this.selectedAddOnItems.length > 0) {
           if (matchedObj.plan_term_month > 1) {
             //yearly
             let year = matchedObj.plan_term_month / 12;
             let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
               return accumulator + (currentValue.yearly_price * year);
             }, 0);
             addOnAmount = parseFloat(addOnAmount).toFixed(2)
             this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);
 
           } else {
             //Monthly
             let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
               return accumulator + currentValue.monthly_price;
             }, 0);
             addOnAmount = Number(addOnAmount).toFixed(2);
             this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
           }
         } else {
           this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
         }
       } */
      // Calculate Subtotal
      if (this.f['policy_amount'].value) {
        if (this.f['addon_coverage_amount'].value) {
          const policyAmount = Number(this.f['policy_amount'].value);
          const addonCoverageAmount = Number(this.f['addon_coverage_amount'].value);

          let sub_total_amount = policyAmount + addonCoverageAmount;
          this.renewPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount.toFixed(2));
          this.renewPolicyForm.controls['total_price'].setValue(sub_total_amount.toFixed(2));
          this.renewPolicyForm.controls['net_amount'].setValue(sub_total_amount.toFixed(2));
        } else {
          let sub_total_amount = parseFloat(this.f['policy_amount'].value).toFixed(2)
          this.renewPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount)
          this.renewPolicyForm.controls['total_price'].setValue(sub_total_amount)
          this.renewPolicyForm.controls['net_amount'].setValue(sub_total_amount)
        }
      }
      if (this.selectedAddOnItems.length == 0) {
        this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
      }

      this.taxAmountCalculate()
    }
    this.formValidationSvc.forms()

  }
  calculateAddOnSubtotalPrice() {
    if (this.f['plan_terms_id']) {
      let matchedObj = _.find(this.planTermList, { 'plan_terms_id': parseInt(this.f['plan_terms_id'].value) });
      //this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
      if (matchedObj) {
        if (this.selectedAddOnItems.length > 0) {
          if (matchedObj.plan_term_month > 1) {
            //yearly
            let year = matchedObj.plan_term_month / 12;
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + (currentValue.yearly_price * year);
            }, 0);
            addOnAmount = parseFloat(addOnAmount).toFixed(2)
            this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount * 1);

          } else {
            //Monthly
            let addOnAmount = this.selectedAddOnItems.reduce((accumulator: number, currentValue: any) => {
              return accumulator + currentValue.monthly_price;
            }, 0);
            addOnAmount = Number(addOnAmount).toFixed(2);
            this.renewPolicyForm.controls['addon_coverage_amount'].setValue(addOnAmount);
          }
        } else {
          this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0);
        }
      }
      // Calculate Subtotal
      if (this.f['policy_amount'].value) {
        if (this.f['addon_coverage_amount'].value) {
          const policyAmount = Number(this.f['policy_amount'].value);
          const addonCoverageAmount = Number(this.f['addon_coverage_amount'].value);

          let sub_total_amount = policyAmount + addonCoverageAmount;
          this.renewPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount.toFixed(2));
          this.renewPolicyForm.controls['total_price'].setValue(sub_total_amount.toFixed(2));
          this.renewPolicyForm.controls['net_amount'].setValue(sub_total_amount.toFixed(2));
        } else {
          let sub_total_amount = parseFloat(this.f['policy_amount'].value).toFixed(2)
          this.renewPolicyForm.controls['sub_total_amount'].setValue(sub_total_amount)
          this.renewPolicyForm.controls['total_price'].setValue(sub_total_amount)
          this.renewPolicyForm.controls['net_amount'].setValue(sub_total_amount)
        }
      }
      if (this.selectedAddOnItems.length == 0) {
        this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
      }

      this.taxAmountCalculate()
    }
    this.formValidationSvc.forms()

  }
  resetCalculation() {
    this.renewPolicyForm.controls['holding_period'].setValue(30)
    this.renewPolicyForm.controls['policy_start_date'].setValue(moment().add(30, 'days').format("YYYY-MM-DD"));
    this.renewPolicyForm.controls['policy_end_date'].setValue(null)
    this.renewPolicyForm.controls['expiry_with_bonus'].setValue(null)
    this.renewPolicyForm.controls['policy_amount'].setValue(0)
    this.selectedAddOnItems = []
    this.renewPolicyForm.controls['addon_coverage_amount'].setValue(0)
    this.renewPolicyForm.controls['sub_total_amount'].setValue(0)
    // this.renewPolicyForm.controls['tax_percentage'].setValue(0)
    this.renewPolicyForm.controls['tax_amount'].setValue(0)
    this.renewPolicyForm.controls['total_price'].setValue(0)
    this.renewPolicyForm.controls['net_amount'].setValue(0)
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
    this.renewPolicyForm.controls['expiry_with_bonus'].setValue(endWithBonusDate);

  };

  /* changePaymentTab(payment_type: any) {
    if (payment_type == 1) {
      // Credit Card Payment
      this.renewPolicyForm.controls['payment_type'].setValue(payment_type);
      this.renewPolicyForm.controls['bankAccountHolderName'].setValue(null);
      this.renewPolicyForm.controls['bankAccountNumber'].setValue(null);
      this.renewPolicyForm.controls['routingNumber'].setValue(null);
      this.renewPolicyForm.controls['bankAccountHolderName'].clearValidators();
      this.renewPolicyForm.controls['bankAccountNumber'].clearValidators();
      this.renewPolicyForm.controls['routingNumber'].clearValidators();
      this.renewPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.renewPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['routingNumber'].updateValueAndValidity();
      this.showPaymentOption()
      //set validator
      if (this.f['newOrSavedCard'].value == 2) {
        this.renewPolicyForm.controls['cardNumber'].clearValidators();
      } else {
        this.renewPolicyForm.controls['cardNumber'].setValidators([Validators.required,]);
      }
      this.renewPolicyForm.controls['cardExpiryDate'].setValidators([Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]);
      this.renewPolicyForm.controls['cardHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.renewPolicyForm.controls['cvv'].setValidators([Validators.required]);
      this.renewPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.renewPolicyForm.controls['cvv'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardHolderName'].updateValueAndValidity();
    } else if (payment_type == 2) {
      // Bank  Payment
      this.renewPolicyForm.controls['selectedCardId'].setValue(null)
      this.renewPolicyForm.controls['payment_type'].setValue(payment_type)
      this.renewPolicyForm.controls['cardNumber'].setValue(null);
      this.renewPolicyForm.controls['cardExpiryDate'].setValue(null);
      this.renewPolicyForm.controls['paymentDate'].setValue(null);
      this.renewPolicyForm.controls['cardHolderName'].setValue(null);
      this.renewPolicyForm.controls['cvv'].setValue(null);

      this.renewPolicyForm.controls['cardNumber'].clearValidators();
      this.renewPolicyForm.controls['cardExpiryDate'].clearValidators();
      // this.renewPolicyForm.controls['paymentDate'].clearValidators();
      this.renewPolicyForm.controls['cardHolderName'].clearValidators();
      this.renewPolicyForm.controls['cvv'].clearValidators();
      this.renewPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.renewPolicyForm.controls['cvv'].updateValueAndValidity();
      // this.renewPolicyForm.controls['paymentDate'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardHolderName'].updateValueAndValidity();
      // set validator
      this.renewPolicyForm.controls['bankAccountHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.renewPolicyForm.controls['bankAccountNumber'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.renewPolicyForm.controls['routingNumber'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.renewPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.renewPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['routingNumber'].updateValueAndValidity();
    } else {
      this.renewPolicyForm.controls['bankAccountHolderName'].clearValidators();
      this.renewPolicyForm.controls['bankAccountNumber'].clearValidators();
      this.renewPolicyForm.controls['routingNumber'].clearValidators();
      this.renewPolicyForm.controls['bankAccountHolderName'].updateValueAndValidity();
      this.renewPolicyForm.controls['bankAccountNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['routingNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardNumber'].clearValidators();
      this.renewPolicyForm.controls['cardExpiryDate'].clearValidators();
      this.renewPolicyForm.controls['cvv'].clearValidators();
      this.renewPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.renewPolicyForm.controls['cvv'].updateValueAndValidity();
      this.renewPolicyForm.controls['payment_type'].setValue(payment_type)
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
        this.renewPolicyForm.controls['paymentDate'].setValue(new Date());
        if (this.policyDetails?.customer_details?.card_list?.length > 0) {
          this.renewPolicyForm.controls['newOrSavedCard'].setValue('2');
          if (this.f['newOrSavedCard'].value == 2) {

            this.renewPolicyForm.controls['cardNumber'].clearValidators();
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
        this.renewPolicyForm.controls['paymentDate'].setValue(new Date());
        break;

      case 3: // Escrow Payment
        this.clearPreviousTabValues();
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.renewPolicyForm.controls['paymentDate'].clearValidators();
        this.renewPolicyForm.controls['paymentDate'].updateValueAndValidity();
        break;
      case 4: // Do not charge Payment
        this.clearPreviousTabValues();
        this.clearBankValidators();
        this.clearCreditCardValidators();
        this.renewPolicyForm.controls['paymentDate'].clearValidators();
        this.renewPolicyForm.controls['paymentDate'].updateValueAndValidity();
        break;
      default:
        this.clearBankValidators();
        this.clearCreditCardValidators();
        break;
    }
    this.formValidationSvc.forms();
    this.renewPolicyForm.controls['payment_type'].setValue(payment_type);

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
      this.renewPolicyForm.get(controlName)?.setValue(null);
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
    const control = this.renewPolicyForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  }

  clearValidators(controlName: string) {
    const control = this.renewPolicyForm.get(controlName);
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  onSubmit() {
    this.submitted = true;
    //console.log(this.renewPolicyForm);
    if (this.f['payment_type'].value == 1) {
      this.clearBankValidators();
    }
    if (this.renewPolicyForm.valid && this.validZipBilling && this.f['net_amount'].value > 0) {
      if (this.f['net_amount'].value < this.minimumOrderPrice) {
        this.alertService.warning(`The Total amount should not be less than $${this.minimumOrderPrice.toFixed(2)}`)
        return
      }
      let formValue: any = { ...this.renewPolicyForm.value };
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
        commission_value: commission_value ? commission_value : 0,
        commission_type: 1
      }
      // console.log('payload', payload);

      this.loading = true;
      this.apiSvc.post(`${AppConfig.apiUrl.policy.renewPolicy}/${this.policyId}`, payload).subscribe({
        next: (res: any) => {
          if (res.status == 1) {
            this.loading = false;
            //  // this.getPlansTermList();
            //  this.renewPolicyForm.reset();
            //   this.relaventCommission = null
            //   this.alertService.success(res.message);
            //   this.submitted = false;
            //   this.selectedAddOnItems=[];           
            //   setTimeout(() => {
            //     this.declarerenewPolicyForm(true);
            //   }, 1600);
            this.router.navigate(['/policy-management/policy-renewals']);
          } else {
            this.loading = false;
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; }
      });

    } else {
      this.alertService.error(`One or more mandatory fields are still blank. Please fill up all the mandatory fields to proceed. `)
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.renewPolicyForm);
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
        this.renewPolicyForm.controls['payment_type'].setValue(1);
        this.renewPolicyForm.controls['cardNumber'].clearValidators();
        this.renewPolicyForm.controls['cardNumber'].updateValueAndValidity();
        this.renewPolicyForm.controls['cvv'].clearValidators();
        this.renewPolicyForm.controls['cvv'].updateValueAndValidity();
        this.renewPolicyForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
        this.renewPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.renewPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.renewPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }

    } else {
      this.renewPolicyForm.controls['payment_type'].setValue(1);
      this.renewPolicyForm.controls['cardExpiryDate'].setValidators([Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]);
      this.renewPolicyForm.controls['cardHolderName'].setValidators([Validators.required, this.formValidationSvc.notEmpty]);
      this.renewPolicyForm.controls['cardNumber'].setValidators([Validators.required]);
      this.renewPolicyForm.controls['cvv'].setValidators([Validators.required, this.formValidationSvc.validateCVV]);
      this.renewPolicyForm.controls['cvv'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardNumber'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardExpiryDate'].updateValueAndValidity();
      this.renewPolicyForm.controls['cardHolderName'].updateValueAndValidity();
      this.renewPolicyForm.controls['selectedCardId'].setValue(null);
      this.renewPolicyForm.controls['cardNumber'].setValue(null);
      this.renewPolicyForm.controls['cardExpiryDate'].setValue(null);
      this.renewPolicyForm.controls['cardHolderName'].setValue(null);
      this.renewPolicyForm.controls['cvv'].setValue(null);
      this.renewPolicyForm.controls['paymentDate'].setValue(new Date());

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
        this.renewPolicyForm.controls['payment_type'].setValue(1);
        this.renewPolicyForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.renewPolicyForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.renewPolicyForm.controls['cardExpiryDate'].setValue(card_expiry_date);
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
    this.apiSvc.get(`${AppConfig.apiUrl.serviceCallFees.getAllServiceCallfees}?month=${month}`).subscribe({
      next: (res: any) => {
        this.serviceCallFeesList = res.data
      },
      error: () => { },
      complete: () => { }
    });
  }
}
