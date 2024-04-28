import { Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
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
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-claim-create',
  templateUrl: './claim-create.component.html',
  styleUrls: ['./claim-create.component.scss']
})
export class ClaimCreateComponent {
  createPolicyNoteEleRef?: BsModalRef | null;

  public searchingvalue: any
  public policyList: any = []
  public claimTicketStatusList: any = []
  public selectedPolicy: any
  public claimForm: FormGroup | any
  public submitted!: boolean;
  public showIsuueDetails: boolean = false;
  public loading!: boolean;
  public today = new Date();
  public permissionObj: any;
  public claimList: any = [];
  public brandList: any = [];
  public currentParams:any='';
  public isOpended:boolean=false;
  searchKey = 'full_name'
  policyNoteForm!: FormGroup;
  submittedPolicyNotes = false;

  public customerSavedCardList: any = []
  public productWiseProblems: any = []
  public usersList: any = []
  priorityList: any = []

  resetSearchInput = false;
  raisedNewClaim = true
  autoCompleteConfig={
    searchKeyword:this.searchKey,
    defaultSearchValue:'',
    minQueryLength:3,
    debounceTime:400,
    placeholder : 'Search',
    data : [],
   dataFetched:false
  }as any
  constructor(
    private formValidationSvc: FormValidationService,
    private apiSvc: ApiService,
    private alertService: AlertService,
    private fb: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
    private confrmSvc: ConfirmationDialogService,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,


  ) {
    this.commonSvc.setTitle('Claim Management');
    let currentRoute: any = `claim-management`;
    //let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }

  }
  ngOnInit(): void {
    this.getClaimTicketStatus();
    this.getAllUsersList();
    this.getProductBrand();
    this.getClaimPriority();

    this.activatedRoute.queryParams.subscribe(async (params: any) => {
      if (params) {
       this.currentParams=params
        if (this.currentParams.policy_number) {
          this.searchKey='policy_number';
          this.autoCompleteConfig.defaultSearchValue=this.currentParams.policy_number
          this.searchingvalue=this.currentParams.policy_number
          let response:any= await this.getPolicyDetails(this.currentParams.policy_number);
          if (response.status==1) {
            this.selectPolicy(response.data)
          }
        }
      
      }
    });
  }
  ngAfterViewInit() {
    document.addEventListener('mouseup', (e: any) => {

      //CLOSE NOTIFICATION BOX OUT SIDE CLICK
      let notificationContainer: any = document.getElementsByClassName('priority-dropdown') as HTMLCollectionOf<Element>;
      [...notificationContainer].forEach(element => {
        if (element) {
          if (!element.contains(e.target) && element.classList.contains('opened')) {
            setTimeout(() => {
              this.isOpended = false;
              element.classList.remove('opened');
            }, 50);
          }
        }
      });
    });
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 100);
    }

  selectPriority(obj:any){
      let priorityInput:any = document.getElementById('priorityInput');
      if(priorityInput){
        this.claimForm.patchValue({
          priority:obj.priority_name
        })
        setTimeout(() => {
          this.formValidationSvc.forms();
        }, 100);
      }
  }
  getclaimList() {
    this.apiSvc.post(`${AppConfig.apiUrl.claims.getAllClaims}`, { customer_id: this.selectedPolicy.customer_id, policy_id: this.selectedPolicy.policy_id }).subscribe({
      next: (response: any) => {
        this.claimList = response?.data;

        if (this.claimList.length > 0) {
          const foundObject = this.claimList.find((item: any) => item.claim_ticket_statuses_id != 4);
          this.raisedNewClaim = foundObject ? false : true
        } else {
          this.raisedNewClaim = true
        }
      }
    });
  }
  onChangeSearchKey(){
    this.autoCompleteConfig.data=[];
    this.autoCompleteConfig.searchKeyword=this.searchKey;
    this.autoCompleteConfig.defaultSearchValue=''
    // this.policyList=[]; 
    // this.selectedPolicy=null
    if (this.policyList.length>0) {
      const modifiedData = this.policyList.map(({ policy_id, [this.searchKey]: dynamicKey }: any) => ({
        policy_id,
        [this.searchKey]: dynamicKey // Assuming you want to create a new property with the dynamic key
      }));
      //console.log('modifiedData',modifiedData);
      this.autoCompleteConfig.data=modifiedData;     
    this.autoCompleteConfig.dataFetched=false;
    }
    
  
  }
  autoCompSearchInputValueChange(searchVal:any){
    // this.autoCompleteConfig.data=[]
    this.autoCompleteConfig.searchKeyword=this.searchKey
    this.autoCompleteConfig.defaultSearchValue=searchVal
    // console.log('autoCompSearchInputValueChange',searchVal);
    if (searchVal.length>=3) {
      this.searchingvalue=searchVal;
      this.searchPolicy();     
    }
    if (searchVal.length==0) {
      this.searchingvalue=''
      this.searchPolicy();
    }
  }
  async autoCompSearchInputSelectedValue(selectedObj:any){
      // console.log('autoCompSearchInputSelectedValue',selectedObj);
    if (selectedObj?.policy_id) {
      let response: any = await this.getPolicyDetails(selectedObj.policy_id)
      if (response?.status == 1) {
        this.selectPolicy(response?.data)
      }
      // const filteredData = _.filter(this.policyList, { policy_id: selectedObj?.policy_id }); // Filtering by id 2
      // if (filteredData && filteredData.length>0) {
      //   this.selectPolicy(filteredData[0])
      // }
    }else{
      this.selectedPolicy=null
      this.selectPolicy(null)
    }
    
  }
  
  ngOnDestroy() {
    if (this.currentParams) {
       this.router.navigate([], {
      queryParams: {
        'policy_number': null,
      },
      queryParamsHandling: 'merge'
    })
    }
   
  }
  searchPolicy() {
    // this.selectedPolicy = null
    if (this.searchingvalue.length == 0 || this.searchKey.length == 0) {
      this.policyList = []
      // this.alertService.warning('Please Select Search With');

      return
    }

    let filterSearch = `?${this.searchKey}=${this.searchingvalue}`
    //${this.searchingvalue?`?search=${this.searchingvalue}
    this.autoCompleteConfig.dataFetched=false;
    this.apiSvc.post(`${AppConfig.apiUrl.policy.getAllPolicies}${filterSearch}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (response?.data.length > 0) {
            this.policyList = response?.data;
            this.policyList.forEach((element:any) => {
              element.full_name=`${element.first_name} ${element.last_name}`
            });
            const modifiedData = response?.data.map(({ policy_id, policy_number, policy_status_details,[this.searchKey]: dynamicKey }: any) => ({
              policy_id,
              policy_number, 
              policy_status_details,
              [this.searchKey]: dynamicKey // Assuming you want to create a new property with the dynamic key
            }));
            // console.log('modifiedData',modifiedData);
            this.autoCompleteConfig.data=modifiedData
            this.autoCompleteConfig.searchKeyword=this.searchKey;
          
            //  this.generateDynamicTable(modifiedData,this.searchKey)
            // this.alertService.success(response.message);
           
          } else {
            this.policyList = response?.data;
            this.autoCompleteConfig.data=[];
            // this.alertService.info(response.message)
          }
          this.autoCompleteConfig.dataFetched=true;
         
          // this.selectedPolicy = null
        } else {
        }
      }
    });
  }


  
  navigateToEditClaim(Claim_id: any) {
    const encodedId = encodeURIComponent(btoa(Claim_id));
    this.router.navigate([`/claim-management/edit-claim/${encodedId}`]);
  }
  onChangeProduct(ev: any) {

  }
  getProductWiseProblems() {
    if (!this.f['product_id'].value) {
      return
    }
    this.apiSvc.get(`${AppConfig.apiUrl.productProblems.getAllProductProblems}?active_status=1&product_id=${this.f['product_id'].value}`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.productWiseProblems = response?.data
        }
      }
    })
  }
  getClaimTicketStatus() {
    this.apiSvc.get(`${AppConfig.apiUrl.claims.getAllClaimTicketStatuses}?active_status=1`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.claimTicketStatusList = response?.data
        }
      }
    })
  }

  getProductBrand() {
    this.apiSvc.get(`${AppConfig.apiUrl.brands.getAllBrands}?active_status=1`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.brandList = response?.data
        }
      }
    })
  }

  getClaimPriority() {
    this.apiSvc.get(`${AppConfig.apiUrl.priority.getAllPriority}?active_status=1`).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.priorityList = response?.data
        }
      }
    })
  }
  copyToClipBoard(val: string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }
  
  selectPolicyConfirmation() {
    return new Promise((resolve, reject) => {
      this.confrmSvc.confirm('', `The policy for which you are trying to register a claim is still within the 30-day waiting period. Would you like to file a claim before the policy becomes active?`, 'Yes', 'No').then((res: any) => {
        if (res) {
          resolve(true)
        } else {
          resolve(false)

        }
      })
    });
  }

  async selectPolicy(obj: any) {
    
    if (!obj)return
    
    let claimPermission
    if (obj.policy_status == 2) {
      //POLICY STATUS => 30-day waiting period
      claimPermission = await this.selectPolicyConfirmation()
    } else if (obj.policy_status == 1) {
      claimPermission = true
    }else{
      
       this.alertService.warning(`The policy for which you are trying to file a claim is still in its "${obj?.policy_status_details.status_name}" policy status, no claims can be filed until this status has become active.`)
    }
    if (claimPermission) {
      //this.policyList = [obj]
      /*   if (obj.customer_id) {
          let response: any = await this.getAllCustomerSavedCards(obj.customer_id);
          if (response.status==1) {
          if (response.data) {
            this.customerSavedCardList = response.data;
          }
          }
        } */
      if (obj.policy_id) {
          this.selectedPolicy =obj
        
      }

      /* let selctedCardDetails :any= this.customerSavedCardList.length>0?this.customerSavedCardList.filter((o:any)=>o.primary_card==true)[0]:null;
      if (selctedCardDetails?.card_expiry_date) {
        selctedCardDetails.card_expiry_date=[selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
      }else{
        selctedCardDetails=null
      } */


      this.claimForm = this.fb.group({
        policy_id: [obj.policy_id, [Validators.required]],
        product_problem_id: [null, [Validators.required,]],
        other_issue_type: [null],
        issue_details: [null, [Validators.required,]],
        priority: [null, [Validators.required]],
        product_id: [null, [Validators.required]],
        claim_ticket_statuses_id: [2, [Validators.required]],
        product_issue_date: [null],
        unit_age_month: [null],
        product_brand: [null],
        product_model: [null],
        product_serial_no: [null],
        note: [null],

        customer_id: [obj.customer_id,],
        policy_notes: [null],
        is_assign: [false],
        assign_to: [null],

        /*  newOrSavedCard: [selctedCardDetails?'2': '1', [Validators.required,]],
         selectedCardId: [selctedCardDetails?selctedCardDetails?.customer_card_id:null,],
         cardNumber: [selctedCardDetails?selctedCardDetails?.card_last_4_digit:null, [Validators.required,]],
         cardHolderName: [selctedCardDetails?selctedCardDetails?.card_holder_name:null, [Validators.required,]],
         cardExpiryDate: [selctedCardDetails?selctedCardDetails?.card_expiry_date:null, [Validators.required,]],
         cvv: [null, [Validators.required,]], */
      })
      /* if (selctedCardDetails.customer_card_id) {
        this.claimForm.controls['cvv'].clearValidators();
        this.claimForm.controls['cvv'].updateValueAndValidity();
      } */
      if(this.selectedPolicy?.policy_note_list?.length>0){
        const filteredArray = this.selectedPolicy?.policy_note_list.filter((item:any) => item.note_type === 0);
        this.selectedPolicy.policy_note_list=filteredArray
      }
      if (!this.selectedPolicy) {
        return
      }
      setTimeout(() => {
        this.getclaimList();

        this.formValidationSvc.forms()
      }, 200);
    }else{
      this.autoCompleteConfig.defaultSearchValue=null
    }
  }
  getPolicyDetails(policyParam: any) {
    return new Promise<void>((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.policy.getPolicyDetails}/${policyParam}`, '').subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (err) => {
          reject(err)
        },
      })
    })
  }
  get f() { return this.claimForm.controls; }
  get n() { return this.policyNoteForm.controls; }


  changePurchaseDate(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }
  reset() {
    if (this.claimForm) {
      this.claimForm.reset()
      this.submitted = false
    }
    this.searchingvalue = ''
    this.selectedPolicy = null;
    this.policyList = [];
  }

  onChangeNewOrSavedCard() {
    if (this.f['newOrSavedCard'].value == 2) {
      let selctedCardDetails = this.customerSavedCardList?.filter((o: any) => o.primary_card == true)[0];
      if (selctedCardDetails) {
        this.claimForm.controls['cardNumber'].clearValidators();
        this.claimForm.controls['cardNumber'].updateValueAndValidity();
        this.claimForm.controls['cvv'].clearValidators();
        this.claimForm.controls['cvv'].updateValueAndValidity();
        this.claimForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
        this.claimForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.claimForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.claimForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }

    } else {
      this.claimForm.controls['cardNumber'].setValidators([Validators.required,]);
      this.claimForm.controls['cardNumber'].updateValueAndValidity();
      this.claimForm.controls['cvv'].setValidators([Validators.required,]);
      this.claimForm.controls['cvv'].updateValueAndValidity();
      this.claimForm.controls['selectedCardId'].setValue(null);
      this.claimForm.controls['cardNumber'].setValue(null);
      this.claimForm.controls['cardExpiryDate'].setValue(null);
      this.claimForm.controls['cardHolderName'].setValue(null);
      this.claimForm.controls['cvv'].setValue(null);
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 100);
  }
  openPolicyNoteModal(template: any = null, obj: any = null) {
    if (template) {
      this.createPolicyNoteEleRef = this.mdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    this.policyNoteForm = this.fb.group({
      notes: ['', [Validators.required,]],
      policy_id: [this.selectedPolicy?.policy_id, [Validators.required]],
      is_assign: [false],
      assign_to: [null],
    });
    this.formValidationSvc.forms();
  };
  closeCreatePolicyNoteModal() {
    this.policyNoteForm.reset();
    this.submittedPolicyNotes = false;
    this.createPolicyNoteEleRef?.hide();
    this.loading = false
  }
  onChangecard() {
    if (this.f['selectedCardId'].value) {
      let customer_card_id = this.f['selectedCardId'].value;
      // this.claimForm.controls['selectedCardId'].setValue(customer_card_id)
      let selctedCardDetails = this.customerSavedCardList?.filter((o: any) => o.customer_card_id == customer_card_id)[0];
      if (selctedCardDetails) {
        this.claimForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.claimForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.claimForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }
    }
  }
  getAllCustomerSavedCards(customer_id: number) {
    return new Promise((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.customerCards.getCustomerAllSavedCardList}/${customer_id}`, '').subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: () => { },
        complete: () => { }
      });
    });
  }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.searchPolicy();
  }
  getAllUsersList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsersList}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          //console.log(response);
          this.usersList = response.data;
          this.usersList.forEach((element:any) => {
            element.name_email=`${element?.first_name} ${element?.last_name} [ ${element?.email} ]`
            element.image=element.profile_image?element.profile_image:`assets/img/profile.jpg`
          });
        }
      },
      error: () => {
      },
      complete: () => {
        // this.getCustomerCardList()
      }
    });
  }

  assignChecked(ev: any, isPolicyNoteForm=false) {
    if (isPolicyNoteForm) {
      this.policyNoteForm.controls['is_assign'].setValidators([Validators.required])
      if (this.policyNoteForm.controls['is_assign'].value == true) {
        this.policyNoteForm.controls['policy_notes']?.setValidators([Validators.required,]);
        this.policyNoteForm.controls['policy_notes']?.updateValueAndValidity();
        this.policyNoteForm.controls['assign_to']?.setValidators([Validators.required,]);
        this.policyNoteForm.controls['assign_to']?.updateValueAndValidity();
      } else {
        this.policyNoteForm.controls['policy_notes']?.clearValidators();
        this.policyNoteForm.controls['policy_notes']?.updateValueAndValidity();
  
        this.policyNoteForm.controls['assign_to']?.setValue(null)
        this.policyNoteForm.controls['assign_to']?.clearValidators();
        this.policyNoteForm.controls['assign_to']?.updateValueAndValidity();
      }
    }else{
      this.claimForm.controls['is_assign'].setValidators([Validators.required])
      if (this.claimForm.controls['is_assign'].value == true) {
        this.claimForm.controls['policy_notes']?.setValidators([Validators.required,]);
        this.claimForm.controls['policy_notes']?.updateValueAndValidity();
        this.claimForm.controls['assign_to']?.setValidators([Validators.required,]);
        this.claimForm.controls['assign_to']?.updateValueAndValidity();
      } else {
        this.claimForm.controls['policy_notes']?.clearValidators();
        this.claimForm.controls['policy_notes']?.updateValueAndValidity();
  
        this.claimForm.controls['assign_to']?.setValue(null)
        this.claimForm.controls['assign_to']?.clearValidators();
        this.claimForm.controls['assign_to']?.updateValueAndValidity();
      }
    }
    if (ev) {
      setTimeout(() => {
        this.formValidationSvc.forms();
      }, 200);
    }
  }
  selectAssigneToUser(userObj:any,isPolicyNoteForm=false){
    
    // if (userObj) {
    //   this.claimForm.patchValue({assign_to:userObj.org_user_id})
    // }else{
    //   this.claimForm.patchValue({assign_to:null})

    // }
    if (userObj && isPolicyNoteForm) {
      this.policyNoteForm.patchValue({assign_to:userObj.org_user_id})
    }else if (userObj && !isPolicyNoteForm) {
      this.claimForm.patchValue({assign_to:userObj.org_user_id})
    }else {
      this.policyNoteForm.patchValue({assign_to:null})
      this.claimForm.patchValue({assign_to:null})

    }
  }

  selectedBrand(brandObj:any){
    if (brandObj) {
      this.claimForm.patchValue({product_brand:brandObj.brand_name})
    }else{
      this.claimForm.patchValue({product_brand:null})

    }
  }

  autoCompBrandChange(e:any){
    this.claimForm.patchValue({product_brand:null})
  }
  onChangeAssigneToUservalue(searchVal:any){
      this.claimForm.patchValue({assign_to:null})
  }
  onSubmit() {
    this.submitted = true;
    if (!this.claimForm.valid) {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.claimForm);
      return
    }
    if (!this.claimForm.value.product_brand) {
      this.alertService.error('select a valid brand');
      return
    }
    let formValue: any = { ...this.claimForm.value };
    formValue.cardExpiryDate = formValue.cardExpiryDate ? formValue.cardExpiryDate.replace(/\//g, '') : null;
    formValue.cardNumber = formValue.cardNumber ? formValue.cardNumber.replace(/\s+/g, '') : null
    formValue.product_problem_id = formValue.product_problem_id == 'Other' ? null : formValue.product_problem_id
    formValue.product_issue_date = this.claimForm.value.product_issue_date ? moment(this.claimForm.value.product_issue_date).format("YYYY-MM-DD") : null

   this.loading = true;
    this.apiSvc.post(`${AppConfig.apiUrl.claims.createClaim}`, formValue).subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          // if (formValue.policy_notes) {
          //     this.onSubmitPolicyNote()
          // }
          this.loading = false;
          // this.getPlansTermList();
          this.claimForm.reset();
          this.alertService.success(res.message);
          this.submitted = false;
          this.selectedPolicy = null;
          this.searchingvalue = null;
          this.policyList = [];
          //this.router.navigate([`/claim-management/thank-you/${}`]);
          // this.router.navigate(['/claim-management/thank-you'], {
          //   queryParams: {
          //     claim_number:res.data.ticket_no,
          //     claim_id: res.data.claim_id, 
          //   },
          //   queryParamsHandling: 'merge',
          // });
          const encodedId = encodeURIComponent(btoa(res.data.claim_id));
          this.router.navigate([`/claim-management/thank-you/${encodedId}`]);
         /*  this.confrmSvc.confirm('Claim created successfully', `Want to create new claim ?`, 'Yes', 'No').then((res: any) => {
            if (res) {

            } else {

              this.router.navigate(['/claim-management']);
            }
          }).catch(() => {

          }); */
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });

  }
  onChangeProductIssueType(val: any) {
    if (val == 'Other') {
      // this.claimForm.controls['issue_type']?.setValue(val);
      this.claimForm.controls['other_issue_type']?.setValidators([Validators.required,]);
      this.claimForm.controls['other_issue_type']?.updateValueAndValidity();
    } else {
      this.claimForm.controls['other_issue_type']?.clearValidators();
      this.claimForm.controls['other_issue_type']?.updateValueAndValidity();
      this.claimForm.controls['other_issue_type']?.setValue(null);
    }
    setTimeout(() => {
      this.formValidationSvc.forms()
    }, 200);

  }
getpolicyNoteList(){
  this.apiSvc.post(`${AppConfig.apiUrl.policyNoteTask.getPolicyTaskByPolicyId}/${this.selectedPolicy.policy_id}`, '').subscribe({
    next: async (response: any) => {
      if (response.status == 1) {
         this.alertService.success(response.message);
         if (response.status==1) {
          //  this.selectPolicy(response.data)
           this.selectedPolicy.policy_note_list=response.data
         }
         this.closeCreatePolicyNoteModal()
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
}
  onSubmitPolicyNote() {
    this.submittedPolicyNotes=true
    if (!this.policyNoteForm.valid) {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.policyNoteForm);
      return
    }
    this.loading = true;

    const { customer_id } = this.selectedPolicy
    let payLoad = {
      ...this.policyNoteForm?.value,
      note_type:0
     }
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.createCustomerPolicyNote}/${customer_id}`, payLoad).subscribe({
      next: async (response: any) => {
        if (response.status == 1) {
           this.alertService.success(response.message);
           let policyRes:any= await this.getPolicyDetails(this.selectedPolicy.policy_id);
           if (policyRes.status==1) {
             //this.selectPolicy(policyRes.data)
             this.getpolicyNoteList()
           }
           this.closeCreatePolicyNoteModal()
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

  }

  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
}

