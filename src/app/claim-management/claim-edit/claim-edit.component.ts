import { Component, TemplateRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-claim-edit',
  templateUrl: './claim-edit.component.html',
  styleUrls: ['./claim-edit.component.scss']
})
export class ClaimEditComponent {

  public searchingvalue: any
  public claimDetails: any = []
  public productWiseProblems: any = []
  public claimTicketStatusList: any = []
  public usersList: any = []
  brandList: any = []
  priorityList: any = []
  public selectedPolicy: any
  public claimForm: FormGroup | any
  public submitted!: boolean;
  public loading!: boolean;
  public today = new Date();
  public permissionObj: any
  public customerSavedCardList: any = []
  public claimId: any
  public policyNoteTaskList: any
  public selectedContractorId: any
  contractorsList: any;
  public isOpended: boolean = false;

  claimNotesTableHeaders = [
    "#",
    "Notes",
    "Created By",
    "Created On",
  ]
  claimNotesTableData: any = [];
  policyNotesTableHeaders = [
    "#",
    "Notes",
    "Assigned To",
    "Created By",
    "Created On",
  ]
  policyNotesTableData: any = [];
  assignedContractorsList: any = []
  viewContractorsModalRef?: BsModalRef | null;
  constructor(
    private formValidationSvc: FormValidationService,
    private apiSvc: ApiService,
    private alertService: AlertService,
    private fb: UntypedFormBuilder,
    private commonSvc: CommonService,
    private router: Router,
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
    this.activatedRoute.paramMap.subscribe((params) => {
      const encodedId: any = params.get('claim_id');
      this.claimId = atob(decodeURIComponent(encodedId));

    });
  }
  ngOnInit(): void {
    this.getClaimTicketStatus();
    this.getClaimDetails();
    this.getProductBrand();
    this.getClaimPriority();
    this.getAllUsersList()
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
  async getClaimDetails() {
    this.apiSvc.get(`${AppConfig.apiUrl.claims.getClaimDetails}/${this.claimId}`).subscribe({
      next: async (response: any) => {
        if (response.status == 1) {
          this.claimDetails = response?.data;
          if (this.claimDetails.customer_id) {
            let response: any = [] //= await this.getAllCustomerSavedCards(this.claimDetails.customer_id);
            if (response.data) {
              this.customerSavedCardList = response.data;

            }
            this.getPolicyNoteTaskList(this.claimDetails.policy_id);
            this.getContractors(this.claimDetails.product_id)
          }

          let selctedCardDetails: any = this.customerSavedCardList.length > 0 ? this.customerSavedCardList.filter((o: any) => o.primary_card == true)[0] : null;
          if (selctedCardDetails?.card_expiry_date) {
            selctedCardDetails.card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
          } else {
            selctedCardDetails = null
          }
          let problemRes: any = await this.getProductWiseProblems(this.claimDetails.product_id);
          if (problemRes) {
            this.productWiseProblems = problemRes.data
          }

          this.claimForm = this.fb.group({
            policy_id: [this.claimDetails.policy_id, [Validators.required]],
            product_problem_id: [this.claimDetails.product_problem_id ? this.claimDetails.product_problem_id : 'Other', [Validators.required]],
            other_issue_type: [this.claimDetails.other_issue_type],

            issue_details: [this.claimDetails.issue_details, [Validators.required,]],

            priority: [this.claimDetails.priority, [Validators.required]],
            product_id: [this.claimDetails.product_id, [Validators.required]],
            claim_ticket_statuses_id: [this.claimDetails.claim_ticket_statuses_id, [Validators.required]],
            product_issue_date: [this.claimDetails.product_issue_date ? new Date(this.claimDetails.product_issue_date) : null],
            product_brand: [this.claimDetails.product_brand],
            product_model: [this.claimDetails.product_model],
            product_serial_no: [this.claimDetails.product_serial_no],
            note: [this.claimDetails.note],

            customer_id: [this.claimDetails.customer_id,],
            policy_notes: [null],
            is_assign: [false],
            assign_to: [null],
            /*   newOrSavedCard: [selctedCardDetails?'2': '1', [Validators.required,]],
              selectedCardId: [selctedCardDetails?selctedCardDetails?.customer_card_id:null,],
              cardNumber: [selctedCardDetails?selctedCardDetails?.card_last_4_digit:null, [Validators.required,]],
              cardHolderName: [selctedCardDetails?selctedCardDetails?.card_holder_name:null, [Validators.required,]],
              cardExpiryDate: [selctedCardDetails?selctedCardDetails?.card_expiry_date:null, [Validators.required,]],
              cvv: [null, [Validators.required,]], */
          })
          console.log('(this.claimDetails?.claim_note_list', this.claimDetails?.claim_note_list);
          this.setClaimNotesTableData(this.claimDetails?.claim_note_list)
          setTimeout(() => {
            this.claimForm.patchValue({
              product_problem_id: this.claimDetails.product_problem_id ? this.claimDetails.product_problem_id : 'Other'
            })
            this.formValidationSvc.forms()
          }, 400);
          // this.alertService.success(response.message)
        } else if (response.status == 0) {
          this.alertService.error(response.message)
        }
      }
    });
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
  getProductWiseProblems(product_id: any) {
    return new Promise((resolve, reject) => {
      this.apiSvc.get(`${AppConfig.apiUrl.productProblems.getAllProductProblems}?active_status=1&product_id=${product_id}`).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: () => { },
        complete: () => { }
      });
    });
  }


  get f() { return this.claimForm.controls; }


  changePurchaseDate(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }
  getAllUsersList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsersList}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          //console.log(response);
          this.usersList = response.data;
          this.usersList.forEach((element: any) => {
            element.name_email = `${element?.first_name} ${element?.last_name} [ ${element?.email} ]`
            element.image = element.profile_image ? element.profile_image : `assets/img/profile.jpg`
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
  assignChecked(ev: any) {
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
    if (ev) {
      setTimeout(() => {
        this.formValidationSvc.forms();
      }, 200);
    }
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
  onChangeNewOrSavedCard() {
    if (this.f['newOrSavedCard'].value == 2) {
      let selctedCardDetails = this.customerSavedCardList?.filter((o: any) => o.primary_card == true)[0];
      if (selctedCardDetails) {
        this.claimForm.controls['cardNumber'].clearValidators();
        this.claimForm.controls['cardNumber'].updateValueAndValidity();
        this.claimForm.controls['selectedCardId'].setValue(selctedCardDetails.customer_card_id)
        this.claimForm.controls['cardHolderName'].setValue(selctedCardDetails?.card_holder_name);
        this.claimForm.controls['cardNumber'].setValue(selctedCardDetails?.card_last_4_digit);
        let card_expiry_date = [selctedCardDetails?.card_expiry_date.slice(0, 2), '/', selctedCardDetails?.card_expiry_date.slice(2)].join('');
        this.claimForm.controls['cardExpiryDate'].setValue(card_expiry_date);
      }
      setTimeout(() => {
        this.formValidationSvc.forms();
      }, 500);
    } else {
      this.claimForm.controls['cardNumber'].setValidators([Validators.required,]);
      this.claimForm.controls['cardNumber'].updateValueAndValidity();
      this.claimForm.controls['selectedCardId'].setValue(null);
      this.claimForm.controls['cardNumber'].setValue(null);
      this.claimForm.controls['cardExpiryDate'].setValue(null);
      this.claimForm.controls['cardHolderName'].setValue(null);
      this.claimForm.controls['cvv'].setValue(null);
    }

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
  getPolicyNoteTaskList(policy_id: any) {
    if (!policy_id) return
    let url = `${AppConfig.apiUrl.policyNoteTask.getPolicyTaskByPolicyId}/${policy_id}?note_type=1`;
    this.apiSvc.post(url, '').subscribe({
      next: (val: any) => {
        this.policyNoteTaskList = val?.data;
        console.log('   this.policyNoteTaskList', this.policyNoteTaskList);

        this.setPolicyNotesTableData(this.policyNoteTaskList)
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (!this.claimForm.valid) {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.claimForm);
      return
    }
    let formValue: any = { ...this.claimForm.value };
    /*  formValue.cardExpiryDate = formValue.cardExpiryDate  ? formValue.cardExpiryDate.replace(/\//g, '') : null;
      formValue.cardNumber = formValue.cardNumber ? formValue.cardNumber.replace(/\s+/g, '') : null */
    formValue.product_problem_id = formValue.product_problem_id == 'Other' ? null : formValue.product_problem_id

    formValue.product_issue_date = this.claimForm.value.product_issue_date ? moment(this.claimForm.value.product_issue_date).format("YYYY-MM-DD") : null
    this.loading = true;
    this.apiSvc.put(`${AppConfig.apiUrl.claims.updateClaim}/${this.claimId}`, formValue).subscribe({
      next: (res: any) => {
        if (res.status == 1) {

          this.loading = false;
          // this.getPlansTermList();
          this.claimForm.reset();
          this.alertService.success(res.message);
          this.submitted = false;
          this.selectedPolicy = null;
          this.searchingvalue = null;
          this.getClaimDetails();
        } else {
          this.alertService.error(res.message)
          this.loading = false;
        }
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });

  }


  setClaimNotesTableData(arr = []) {
    if (arr.length === 0) return;
    let tableJson = {}
    this.claimNotesTableData = []
    arr.forEach((item: any, i: any) => {
      tableJson = {
        "#": i + 1,
        "Notes": item?.note,
        "Created By":item.created_user_info ? `${item.created_user_info?.first_name} ${item.created_user_info?.last_name}` : "N/A",
        "Created On": moment(item.created_at).format('MM-DD-YYYY HH:MM'),
      }
      this.claimNotesTableData.push(tableJson)
    });
    /*   arr.forEach((element: any, i: number) => {
        this.claimNotesTableData.forEach((dataItem: any) => {
          const matchingHeader = this.claimNotesTableHeaders.find(headerItem => headerItem.key === dataItem.key);
          if (matchingHeader) {
            switch (matchingHeader.key) {
              case 'sl_no':
                dataItem.value = i;
                break;
              case 'created_at':
                // Format the date to MM-DD-YYYY format
                const formattedDate =moment(element[matchingHeader.key]).format('MM-DD-YYYY');
                dataItem.value = formattedDate;
                break;
              case 'created_by':
                // Concatenate first_name and last_name
                const fullName = `${element.created_user_info?.first_name} ${element.created_user_info?.last_name}`;
                dataItem.value = fullName;
                break;
              default:
                // For other keys, assign the respective values from the data
                dataItem.value = element[matchingHeader.key];
                break;
            }
          }
        });
      }); */
  }
  setPolicyNotesTableData(arr = []) {
    if (arr.length === 0) return;
    let tableJson = {}
    this.policyNotesTableData = []
    arr.forEach((item: any, i: any) => {
      tableJson = {
        "#": i + 1,
        "Notes": item?.notes,
        "Assigned To": item.assignee_user_info ? `${item.assignee_user_info?.first_name} ${item.assignee_user_info?.last_name} (${item.assignee_user_info?.email})` : "N/A",
        "Created By": item.created_user_info ? `${item.created_user_info?.first_name} ${item.created_user_info?.last_name}` : "N/A",
        "Created On": moment(item.created_at).format('MM-DD-YYYY HH:MM'),
      }
      this.policyNotesTableData.push(tableJson)
    });
    /*  arr.forEach((element: any, i: number) => {
       this.policyNotesTableData.forEach((dataItem: any) => {
         const matchingHeader = this.policyNotesTableHeaders.find(headerItem => headerItem.key === dataItem.key);
         if (matchingHeader) {
           switch (matchingHeader.key) {
             case 'sl_no':
               dataItem.value = i+1;
               break;
             case 'created_at':
               // Format the date to MM-DD-YYYY format
               const formattedDate =moment(element[matchingHeader.key]).format('MM-DD-YYYY');
               dataItem.value = formattedDate;
               break;
             case 'assign_to_org_user_id':
               // Concatenate first_name and last_name
               if (element.assignee_user_info) {
                 const assginInfofullName = `${element.assignee_user_info?.first_name} ${element.assignee_user_info?.last_name} (${element.assignee_user_info?.email})`;
                 dataItem.value = assginInfofullName;
               }else{
                 dataItem.value = null
               }
              
               break;
             case 'created_by':
               // Concatenate first_name and last_name
               const fullName = `${element.created_user_info?.first_name} ${element.created_user_info?.last_name}`;
               dataItem.value = fullName;
               break;
             default:
               // For other keys, assign the respective values from the data
               dataItem.value = element[matchingHeader.key];
               break;
           }
         }
       });
     }); */
   // console.log('this.policyNotesTableData', this.policyNotesTableData);

  }
  openAssignTechnicianModel(template: TemplateRef<any>, obj: any = null) {
    this.viewContractorsModalRef = this.mdlSvc.show(template, { class: 'modal-xxl', backdrop: 'static' });
    // this.selectedContractorId = null
    this.selectedContractorId = this.claimDetails.assigned_contractors_list.length>0?this.claimDetails.assigned_contractors_list[0].contractor_id: null
  }

  getContractors(product_id: any,) {
    this.apiSvc.post(`${AppConfig.apiUrl.contractors.getAllContractors}?active_status=1&product_id=${product_id}&service_location=${this.claimDetails.policy_details.billing_zip}`, '').subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          this.contractorsList = res.data
        }
      },
      error: () => { },
      complete: () => { }
    });
  }

  createAssignJob() {
    if (!this.selectedContractorId) {
      return
    }
    this.loading = true
    let payLoad = {
      claim_id: this.claimDetails.claim_id,
    }
    this.apiSvc.post(`${AppConfig.apiUrl.contractors.assignJob}/${this.selectedContractorId}`, payLoad).subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          this.alertService.success(res.message);
          this.getClaimDetails()
          this.viewContractorsModalRef?.hide()
        } else {
          this.alertService.error(res.message)
        }
      },
      error: () => { },
      complete: () => { this.loading = false }
    });
  }

  selectAssigneToUser(userObj: any) {
    console.log('userObj', userObj);
    if (userObj) {
      this.claimForm.patchValue({ assign_to: userObj.org_user_id })
    } else {
      this.claimForm.patchValue({ assign_to: null })
    }
  }
  onChangeAssigneToUservalue(searchVal: any) {
    this.claimForm.patchValue({ assign_to: null })
  }
  selectedBrand(brandObj: any) {


    if (brandObj) {
      this.claimForm.patchValue({ product_brand: brandObj.brand_name })
    } else {
      this.claimForm.patchValue({ product_brand: null })

    }
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
  selectPriority(obj: any) {
    let priorityInput: any = document.getElementById('priorityInput');
    if (priorityInput) {
      this.claimForm.patchValue({
        priority: obj.priority_name
      })
      setTimeout(() => {
        this.formValidationSvc.forms();
      }, 100);
    }
  }
}

