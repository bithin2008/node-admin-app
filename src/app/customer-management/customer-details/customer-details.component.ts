import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as saveAs from 'file-saver';
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
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent {
  editPaymentModalRef?: BsModalRef | null;
  viewPolicyModalRef?: BsModalRef | null;
  createPolicyNoteEleRef?: BsModalRef | null;
  addCardEleRef?: BsModalRef | null;
  policyDocEleRef?: BsModalRef | null;
  viewPolicyObj: any
  permissionObj: any
  customerId: any;
  customerDetails: any
  policyDoc: any
  totalPolicyAmount: any
  totalPremiumAmount: any
  totalPremiumPaidAmount: any
  loading = false;
  submittedPayment = false;
  submittedCard = false;
  submittedPolicyNotes = false;
  submittedPolicyDoc = false;
  policyDocumentList: any
  paymentForm!: FormGroup;
  policyNoteForm!: FormGroup;
  cardForm!: FormGroup;
  policyDocForm!: FormGroup;
  editPaymentObj: any
  claimList: any = [];
  activeClaim: any = [];
  customerSavedCardList: any = [];
  customersNotesData: any = [];
  customersAuditData: any = [];
  usersList: any = [];
  paymentList: any = [];
  paymentStatusList: any = [];
  accessData: any = {};
  //------------
  isEdit: boolean = false;
  customerForm: any;
  editObj: any = {};
  modalRef?: BsModalRef | null;
  public submitted!: boolean;
  validZipMessage = '';
  validZip: boolean = false;
  maxPaymentReceivedDate = new Date();
  uploadedDoc: any;
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  };
  sortField: string = 'created_at'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200, 300];
  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    private commonSvc: CommonService,
    private router: Router,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private formValidationSvc: FormValidationService,
    private cd: ChangeDetectorRef

  ) {
    this.commonSvc.setTitle('Customer Details');
    let permissionObj=checkAccessPermission('customer-management');
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    } 

    this.activatedRoute.paramMap.subscribe((params: any) => {
      const encodedId: any = params.get('customer_id');
      this.customerId = atob(decodeURIComponent(encodedId));
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 10;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  }
  ngOnInit() {
    this.getCustomerDetails();
    this.getCustomerAllPolicyDocuments()
    this.getclaimList();
    this.getCustomerCardList()
    this.getPolicyNote();
    this.getCustomerAudit();
    this.getAllUsersList();
    this.getAllPolicyAndPaymentStatus()
  }

  getclaimList() {
    this.apiSvc.post(`${AppConfig.apiUrl.claims.getAllClaims}`, { customer_id: this.customerId }).subscribe({
      next: (response: any) => {
        this.claimList = response?.data;
        this.activeClaim = this.claimList.filter((item: any) => item.claim_ticket_statuses_id != 4)
        // console.log(this.claimList);

      }
    });
  }
  getCustomerCardList() {
    this.apiSvc.post(`${AppConfig.apiUrl.customerCards.getCustomerAllSavedCardList}/${this.customerId}`, '').subscribe({
      next: (response: any) => {
        this.customerSavedCardList = response?.data;
        this.customerSavedCardList.sort((a: any, b: any) => (a.primary_card === b.primary_card ? 0 : a.primary_card ? -1 : 1));
      }
    });
  }

  getAllPolicyAndPaymentStatus() {
    let api =`${AppConfig.apiUrl.policy.getAllStatusAndPaymentType}`
    this.apiSvc.post(api, '').subscribe({
      next: (response: any) => {
        if (response.status==1) {
         //console.log(response?.data?.all_payment_status_type?.payment_status);
         this.paymentStatusList=response?.data?.all_payment_status_type?.payment_status;
        }
      }
    });
  }
  getCustomerDetails() {
    let queryOption={
      includePolicyList:[],
      includePaymentList:[]
    }
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getCustomerDetails}/${this.customerId}`,{queryOption}).subscribe({
      next: (response: any) => {
        this.customerDetails = response.data;  
        this.customerDetails?.policy_list?.sort((a:any, b:any) => {
          return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
        });
         
        this.totalPolicyAmount = this.customerDetails.policy_list.reduce((accumulator: number, currentValue: any) => {
          return accumulator + (currentValue.net_amount ? parseFloat(currentValue.net_amount) : 0);
        }, 0);

        this.totalPremiumAmount = this.customerDetails.payment_list.reduce((accumulator: number, currentValue: any) => {
          return accumulator + (currentValue.payment_status != 1 ? currentValue.amount ? parseFloat(currentValue.amount) : 0 : 0);
        }, 0);
        this.totalPremiumPaidAmount = this.customerDetails.payment_list.reduce((accumulator: number, currentValue: any) => {
          return accumulator + (currentValue.payment_status == 1 ? currentValue.amount ? parseFloat(currentValue.amount) : 0 : 0);
        }, 0);

        this.customerDetails.payment_list.forEach((payment: any) => {
          const matchingPolicy = this.customerDetails.policy_list.find((policy: any) => policy.policy_id === payment.policy_id);
          // If a matching policy is found, insert policy_no and policy_status
          if (matchingPolicy) {
            payment.policy_number = matchingPolicy.policy_number;
            payment.policy_status = matchingPolicy.policy_status;
            payment.is_anamaly = matchingPolicy.is_anamaly;
          }
        });
        this.paymentList=this.customerDetails.payment_list
        this.customerDetails.credit_card_payment = []
        this.customerDetails.bank_payment = []
        this.customerDetails.escrow = []
        this.customerDetails.do_not_charge = []
        if (response?.data.payment_list.length > 0) {
          for (let i = 0; i < response?.data.payment_list.length; i++) {
            const element = response?.data.payment_list[i];
            if (element.payment_type == 1) {
              // credit card payment
              this.customerDetails.credit_card_payment.push(element)
            } else if (element.payment_type == 2) {
              //bank payment
              this.customerDetails.bank_payment.push(element)
            } else if (element.payment_type == 3) {
              //escrow
              this.customerDetails.escrow.push(element)
            } else if (element.payment_type == 4) {
              //do_not_charge
              this.customerDetails.do_not_charge.push(element)
            }
          }
        }
        // console.log(this.customerDetails);

        // sort by id in desc order
        this.customerDetails.credit_card_payment.sort((a: any, b: any) => a.payment_status - b.payment_status);
        this.customerDetails.bank_payment.sort((a: any, b: any) => a.payment_status - b.payment_status);
        this.customerDetails.escrow.sort((a: any, b: any) => a.payment_status - b.payment_status);
        this.customerDetails.do_not_charge.sort((a: any, b: any) => a.payment_status - b.payment_status);
        this.paymentList.sort((a: any, b: any) => a.payment_status - b.payment_status);

        /*  let bank_payment = _.find(response?.data.payment_list, { 'payment_type': 2 });
         let credit_card_payment = _.find(response?.data.payment_list, { 'payment_type': 1 });
         console.log('credit_card_payment',credit_card_payment);
         
         this.customerDetails.bank_payment = [];
         this.customerDetails.credit_card_payment = []
         if (bank_payment) {
           this.customerDetails.bank_payment.push(bank_payment)
         }
         if (credit_card_payment) {
           this.customerDetails.credit_card_payment.push(credit_card_payment)
         } */
        // console.log('this.customerDetails', this.customerDetails);
        this.cdRef.detectChanges()
      }
    })
  }

  openViewPolicyModal(template: TemplateRef<any>, obj: any) {
    this.viewPolicyModalRef = this.mdlSvc.show(template, { class: 'modal-fullscreen view-modal', backdrop: 'static' });
    this.viewPolicyObj = obj;
    const currentDate = moment();
    const policyStartDate = moment(obj?.policy_start_date, 'YYYY-MM-DD');
    const policyExpiryDate = moment(obj?.expiry_with_bonus, 'YYYY-MM-DD');
    // Compare the policy start date with the current date
    if (policyStartDate.isAfter(currentDate)) {
      //console.log('Policy start date is in the future.');
      this.viewPolicyObj.policy_days_remaining = moment(policyExpiryDate).diff(policyStartDate, 'days');
    } else {
      // Compare the policy expiry date with the current date
      if (policyExpiryDate.isBefore(currentDate)) {

        //console.log('Policy expiry date is in the future or today.');
        this.viewPolicyObj.policy_days_remaining = 0;
      } else {
        // console.log('Policy expiry date has already passed.');
        this.viewPolicyObj.policy_days_remaining = moment(policyExpiryDate).diff(currentDate, 'days');

      }
    }

  }
  updateSorting(columnName: string) {
    // If the same column is clicked again, toggle the sorting order
    /* if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // If a new column is clicked, set the new sorting column and reset the sorting order to 'asc'
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    // Call your API endpoint to fetch data with the updated sorting parameters
    this.getCustomerList(); */
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.getCustomerAudit();
  }

  openEditPaymentModal(template: TemplateRef<any>, obj: any) {
    this.editPaymentObj = obj
    this.editPaymentModalRef = this.mdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });
    switch (obj?.payment_type) {
      case 1:
        //CREDIT CATRD 
        this.paymentForm = this.fb.group({
          amount: [obj.amount, [Validators.required, this.formValidationSvc.numericTwoDecimal]],
          payment_date: [new Date(obj?.payment_date), [Validators.required]],

        })
        break;
      case 2:
        //Bank Payment
        this.paymentForm = this.fb.group({
          cheque_no: [obj.cheque_no, [Validators.required, this.formValidationSvc.notEmpty]],
          amount: [obj.amount, [Validators.required, this.formValidationSvc.numericTwoDecimal]],
          payment_status: [obj.payment_status, [Validators.required]],
          payment_date: [new Date(obj?.payment_date), [Validators.required]],
        })
        break;
      case 3:
        // Escrow Payment        
        this.paymentForm = this.fb.group({
          cheque_no: [obj.cheque_no, [Validators.required, this.formValidationSvc.notEmpty]],
          amount: [obj.amount, [Validators.required, this.formValidationSvc.numericTwoDecimal]],
          payment_status: [obj.payment_status, [Validators.required]],
          payment_date: [obj?.payment_date ? new Date(obj?.payment_date) : null, [Validators.required]],
          payment_successfull_date: [''],
          notes: ['']
        })
        this.openPolicyNoteModal('', this.editPaymentObj);
        break;
      case 4:
        // Do Not Charge        
        this.paymentForm = this.fb.group({
          cheque_no: [''],
          amount: [obj.amount, [Validators.required, this.formValidationSvc.numericTwoDecimal]],
          payment_status: [obj.payment_status, [Validators.required]],
          payment_date: [obj?.payment_date ? new Date(obj?.payment_date) : null, [Validators.required]],
          payment_successfull_date: [''],
          payment_type: [1, Validators.required],
          transaction_no: [''],
          notes: ['']
        })
        this.onChangePaymentType();
        this.openPolicyNoteModal('', this.editPaymentObj);
        break;

      default:
        //this.paymentForm
        break;
    }
    /*   if (obj?.payment_type == 1) {
        //CREDIT CATRD 
        this.paymentForm = this.fb.group({
          amount: [obj.amount, [Validators.required, this.formValidationSvc.numericTwoDecimal]],
          payment_date: [new Date(obj?.payment_date), [Validators.required]],
        })
  
      } else if (obj?.payment_type == 2) {
        //BANK PAYMENT
        this.paymentForm = this.fb.group({
          cheque_no: [obj.cheque_no, [Validators.required, this.formValidationSvc.notEmpty]],
          amount: [obj.amount, [Validators.required, this.formValidationSvc.numericTwoDecimal]],
          payment_status: [obj.payment_status, [Validators.required]],
          payment_date: [new Date(obj?.payment_date), [Validators.required]],
        })
      } */
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);

  }
  get f() { return this.paymentForm.controls; }
  get c() { return this.cardForm.controls; }
  get n() { return this.policyNoteForm.controls; }
  get d() { return this.policyDocForm.controls; }

  closeEditPaymentModal() {
    this.paymentForm.reset();
    this.submittedPayment = false;
    this.editPaymentObj = {};
    this.loading = false
    this.editPaymentModalRef?.hide()
  }

  onChangePaymentType() {
    if (this.editPaymentObj.payment_type == 4) {
      // for Do not charge only
      if (this.f['payment_type'].value == 1) {
        this.paymentForm.controls['transaction_no']?.setValidators([Validators.required]);
        this.paymentForm.controls['transaction_no']?.updateValueAndValidity();
        this.paymentForm.controls['cheque_no']?.setValue(null)
        this.paymentForm.controls['cheque_no']?.clearValidators();
        this.paymentForm.controls['cheque_no']?.updateValueAndValidity();
      }
      if (this.f['payment_type'].value == 2) {
        this.paymentForm.controls['cheque_no']?.setValidators([Validators.required]);
        this.paymentForm.controls['cheque_no']?.updateValueAndValidity();
        this.paymentForm.controls['transaction_no']?.setValue(null)
        this.paymentForm.controls['transaction_no']?.clearValidators();
        this.paymentForm.controls['transaction_no']?.updateValueAndValidity();
      }
    }
    setTimeout(() => {
      this.formValidationSvc.forms();
    }, 200);
  }

  onChangePaymentStatus() {
    if (this.editPaymentObj.payment_type == 3) {
      // for escrow payment only
      if (this.f['payment_status'].value == 1) {
        this.paymentForm.controls['payment_successfull_date']?.setValidators([Validators.required,]);
        this.paymentForm.controls['payment_successfull_date']?.updateValueAndValidity();
      } else {
        this.paymentForm.controls['payment_successfull_date']?.setValue(null)
        this.paymentForm.controls['payment_successfull_date']?.clearValidators();
        this.paymentForm.controls['payment_successfull_date']?.updateValueAndValidity();
      }
    }
  }
  updatePayment() {
    this.submittedPayment = true;
    this.loading = true;
    if (this.paymentForm.valid) {
      this.paymentForm.value.payment_date = moment(this.paymentForm.value.payment_date).format('YYYY-MM-DD');
      let payLoad = {
        payment_date: this.paymentForm.value?.payment_date ? moment(this.paymentForm.value.payment_date).format('YYYY-MM-DD') : null,
        payment_successfull_date: this.paymentForm.value?.payment_successfull_date ? moment(this.paymentForm.value.payment_successfull_date).format('YYYY-MM-DD') : null,
        cheque_no: this.paymentForm.value?.cheque_no ? this.paymentForm.value.cheque_no : null,
        amount: this.paymentForm.value?.amount ? this.paymentForm.value.amount : null,
        payment_status: this.paymentForm.value?.payment_status ? this.paymentForm.value.payment_status : null,
        payment_type: this.paymentForm.value?.payment_type ? this.paymentForm.value.payment_type : null,
        transaction_no: this.paymentForm.value?.transaction_no ? this.paymentForm.value.transaction_no : null
      }
      if (this.paymentForm.value.notes) {
        this.policyNoteForm.patchValue({
          notes: this.paymentForm.value.notes,
        });
        setTimeout(() => {
          this.formValidationSvc.forms();
          this.onSubmitPolicyNote(false)
        }, 200);
      }


      this.apiSvc.put(`${AppConfig.apiUrl.payments.updatePayment}/${this.editPaymentObj.payment_id}`, payLoad).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.alertService.success(response.message);
            this.closeEditPaymentModal()
            this.getCustomerDetails();
            this.getCustomerAudit();
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

    } else {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.paymentForm);
      return
    }
  }
  reSendCustomerWelcomeMail() {
    this.confrmSvc.confirm('', `Are you sure want to send welcome mail?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.post(`${AppConfig.apiUrl.sendCustomerWelcomeMail}/${this.customerDetails.customer_id}`,'' ).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              this.getCustomerAudit()
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
      }).catch(() => { });
  }
  changeCreditCardPaymentStatus(ev: any, obj: any) {
    if (this.permissionObj?.edit) {
      ev.preventDefault();
      const previousActiveStatus = obj.payment_status;
      let payload = {
        amount: obj.amount,
        payment_date: obj?.payment_date,
        payment_status: obj.payment_status == 4 ? '5' : '4'
      }
      this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'Pending' : 'Deactivate'} Policy No. ${obj.policy_number}  payment ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.put(`${AppConfig.apiUrl.payments.updatePayment}/${obj.payment_id}`, payload).subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.alertService.success(response.message);

              } else {
                this.alertService.error(response.message);
              }
            },
            error: () => {
            },
            complete: () => {
              this.getCustomerDetails()
            }
          });
        }
      }).catch(() => { obj.payment_status = previousActiveStatus; this.cdRef.detectChanges(); });

    } else {
      this.alertService.error(`You are not authorised to do this. `);
    }
  }

  changeDate(e: any) {
    if (e) {
      this.formValidationSvc.forms()
    }
  }
  navigateToEditPolicy(policy_id: any) {
    this.viewPolicyModalRef?.hide()
    const encodedId = encodeURIComponent(btoa(policy_id));
    this.router.navigate([`/policy-management/edit-policy/${encodedId}`]);
  }
  changePrimaryCard(ev: any, obj: any) {
    if (this.permissionObj?.edit) {
      ev.preventDefault();
      this.confrmSvc.confirm('Are you sure', `Do you really want to switch primary Card No. ${obj.card_last_4_digit} ?`, 'Yes', 'No', 'lg').then((res) => {
        if (res) {
          this.apiSvc.post(`${AppConfig.apiUrl.customerCards.updateCustomerPrimaryCard}/${obj.customer_card_id}`, '').subscribe({
            next: (response: any) => {
              if (response.status == 1) {
                this.getCustomerAudit();
                this.alertService.success(response.message);
              } else {
                this.alertService.error(response.message);
              }
            },
            error: () => {
            },
            complete: () => {
              this.getCustomerCardList()
            }
          });
        }
      }).catch(() => { this.cdRef.detectChanges(); });
    } else {
      this.alertService.error(`You are not authorised to do this. `);
    }
  }
  copyToClipBoard(val: string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }


  openAddCardModal(template: TemplateRef<any>,) {
    this.addCardEleRef = this.mdlSvc.show(template, { backdrop: 'static' });
    this.cardForm = this.fb.group({
      //CREDIT CARD 
      cardHolderName: ['', [Validators.required, this.formValidationSvc.notEmpty]],
      cardNumber: ['', [Validators.required,]],
      cardExpiryDate: ['', [Validators.required, this.formValidationSvc.validateExpirationDateFormat, this.formValidationSvc.expiryDateValidator]],
      cardCVV: ['', [Validators.required, this.formValidationSvc.validateCVV]],
    });
    this.formValidationSvc.forms();
  };
  openPolicyDocModal(template: TemplateRef<any>, obj: any = null) {
    this.policyDocEleRef = this.mdlSvc.show(template, { class: 'modal-md', backdrop: 'static' });
    this.policyDocForm = this.fb.group({
      policy_id: [obj ? obj.policy_id : '', [Validators.required]],
      title: [null, [Validators.required,]],
      policy_doc: [null, [Validators.required,]],
    });

    this.formValidationSvc.forms();
  };
  closeCreatePolicyNoteModal() {
    this.policyNoteForm.reset();
    this.submittedPolicyNotes = false;
    this.createPolicyNoteEleRef?.hide();
    this.loading = false
  }
  closeAddCardModal() {
    this.cardForm.reset();
    this.submittedCard = false;
    this.addCardEleRef?.hide();
    this.loading = false
  }
  closePolicyDocModal() {
    this.policyDocForm.reset();
    this.policyDocEleRef?.hide();
    this.loading = false
  }
  onSubmitPolicyNote(showMsz = true) {
    this.submittedPolicyNotes = true;
    if (!this.policyNoteForm.valid) {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.policyNoteForm);
      return
    }
    this.loading = true;
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.createCustomerPolicyNote}/${this.customerId}`, this.policyNoteForm.value).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (showMsz)
            this.alertService.success(response.message);
          this.closeCreatePolicyNoteModal()
          this.getPolicyNote();
          this.getCustomerAudit()
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
  openPolicyNoteModal(template: any = null, obj: any = null) {
    if (template) {
      this.createPolicyNoteEleRef = this.mdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    this.policyNoteForm = this.fb.group({
      notes: ['', [Validators.required,]],
      policy_id: [obj ? obj.policy_id : '', [Validators.required]],
      is_assign: [false],
      assign_to: [null],
    });
    this.formValidationSvc.forms();
  };


  getAllUsersList() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getOrgUsersList}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          //console.log(response);
          this.usersList = response.data;
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
    this.policyNoteForm.controls['is_assign'].setValidators([Validators.required])
    if (this.policyNoteForm.controls['is_assign'].value == true) {
      this.policyNoteForm.controls['assign_to']?.setValidators([Validators.required,]);
      this.policyNoteForm.controls['assign_to']?.updateValueAndValidity();
    } else {
      this.policyNoteForm.controls['assign_to']?.setValue(null)
      this.policyNoteForm.controls['assign_to']?.clearValidators();
      this.policyNoteForm.controls['assign_to']?.updateValueAndValidity();
    }
    if (ev) {
      setTimeout(() => {
        this.formValidationSvc.forms();
      }, 200);
    }
  }
  getPolicyNote() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getCustomerPolicyNote}/${this.customerId}?note_type=0`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customersNotesData = response?.data
        }
      },
    });
  }

  getCustomerAudit() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getCustomerAuditTrail}/${this.customerId}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customersAuditData = response?.data;
          this.paginationObj = response?.pagination;
        }
      },
    });
  }

  onsubmitAddCard() {
    this.submittedCard = true;
    this.loading = true;
    if (!this.cardForm.valid) {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.cardForm);
      return
    }
    let formValue = { ...this.cardForm.value }
    formValue.cardExpiryDate = formValue.cardExpiryDate ? formValue.cardExpiryDate.replace(/\//g, '') : null;
    formValue.cardNumber = formValue.cardNumber ? formValue.cardNumber.replace(/\s+/g, '') : null
    this.apiSvc.post(`${AppConfig.apiUrl.customerCards.createCustomerCard}/${this.customerId}`, formValue).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          this.closeAddCardModal();
          this.getCustomerCardList()
          this.getCustomerAudit()
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

  }
  onsubmitPolicyDoc() {
    this.submittedPolicyDoc = true;
    this.loading = true;

    if (!this.policyDocForm.valid) {
      this.loading = false;
      this.formValidationSvc.validateAllFormFields(this.policyDocForm);
      return
    }
    const formData = new FormData();
    formData.append('policy_id', this.d['policy_id'].value);
    formData.append('title', this.d['title'].value);
    formData.append('policy_doc', this.uploadedDoc);
    this.apiSvc.fileupload(`${AppConfig.apiUrl.orgAdmin.createCustomerPolicyDoc}/${this.customerId}`, formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.alertService.success(response.message);
          this.closePolicyDocModal();
          this.getCustomerAllPolicyDocuments()
          this.getCustomerAudit();
        } else {
          this.alertService.error(response.message);
        }
        this.loading = false;
      },

      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });

  }

  onFileChange(event: any, srcType: string): void {
    if (!event.target.files[0]) {
      return
    }
    this.uploadedDoc = ''
    const fileSize = event.target.files[0].size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      this.alertService.warning('File size exceeds 2MB',);
      var el: any = document.getElementById(srcType);
      el.value = '';
      return
    }
    let validation: any = this.commonSvc.validatePhotoUpload(event.target.files[0].name, ['png', 'jpg', 'jpeg', 'webp', 'doc', 'docx', 'pdf']);
    if (validation) {
      const reader = new FileReader();
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      this.uploadedDoc = file;
      // reader.onload = () => {
      //   this.policyDocForm.patchValue({
      //     policy_doc: file
      //   });
      //   // need to run CD since file load runs outside of zone
      // };
      //  this.policyDocForm.controls['policy_doc'].setValue(event.target.files[0] as File);
    } else {
      var el: any = document.getElementById(srcType);
      el.value = '';
      this.alertService.warning('Only suported png, jpg, jpeg, webp, doc, docx, pdf format',);
      this.policyDocForm.controls['policy_doc'].setValue(null);
    }
    this.cd.detectChanges();
  }

  getCustomerAllPolicyDocuments() {
    this.apiSvc.post(`${AppConfig.apiUrl.orgAdmin.getCustomerPolicyDocList}/${this.customerId}`, '').subscribe({
      next: (response: any) => {
        this.policyDocumentList = response?.data;
      }
    });
  }

  navigateToEditClaim(Claim_id: any) {
    const encodedId = encodeURIComponent(btoa(Claim_id));
    this.router.navigate([`/claim-management/edit-claim/${encodedId}`]);
  }
  downloadPolicyDocument(fileUrl: string) {
    let url = fileUrl;
    this.apiSvc.download(url).subscribe({
      next: (response: any) => {
        this.handleFileDownload(response);

        /* 
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
                this.alertService.success(response.message)*/
      }
    });

  }

  private handleFileDownload(response: any) {
    const contentDispositionHeader = response.headers.get('Content-Disposition');
    const fileName = contentDispositionHeader ? contentDispositionHeader.split(';')[1].split('filename=')[1].trim() : 'file';

    const blob = new Blob([response.body], { type: response.body.type });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  inactiveCardStatus(item: any) {

    this.confrmSvc.confirm('Are you sure', `Do you really want to remove this Card No. ${item.card_last_4_digit} ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.post(`${AppConfig.apiUrl.customerCards.deleteCustomerCard}/${item.customer_card_id}`, '').subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.getCustomerAudit()
              this.alertService.success(response.message);
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
          },
          complete: () => {
            this.getCustomerCardList()
          }
        });
      }
    })
  }


  // --------------------------------------------------

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
    this.modalRef = this.mdlSvc.show(template, { class: 'modal-lg', backdrop: 'static' });
    if (Object.keys(obj).length > 0) {
      this.editObj = obj;
      this.isEdit = true;
      console.log(obj);

      this.validZip = true;
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
              this.getCustomerDetails();
              this.getCustomerAudit();
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

  get g() { return this.customerForm.controls; }


  navigateToCreatePolicy() {

    this.router.navigate(['/policy-management/create-policy'], {
      queryParams: {
        customer_email: this.customerDetails.email,
      },
    });

  }
  navigateToCreateClaim(policy_no: any) {
    this.router.navigate(['/claim-management/create-claim'], {
      queryParams: {
        policy_number: policy_no,
      },
    });

  }



  generatePaymentReceipt(policy_id: any, key: any = null) {
    this.apiSvc.post(`${AppConfig.apiUrl.policy.generatePaymentReceipt}/${policy_id}${key == 'send-mail' ? '/send-mail' : ''}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (key != 'send-mail' && response.payment_receipt_url) {
            const url = response.payment_receipt_url;
            this.downloadFile(url);
          }

          this.alertService.success(response.message);
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
  generateEscrowInvoice(policy_id: any, key: any = null) {
    this.apiSvc.post(`${AppConfig.apiUrl.policy.generateEscrowInvoice}/${policy_id}${key == 'send-mail' ? '/send-mail' : ''}`, '').subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (key != 'send-mail' && response.escrow_invoice_url) {
            const url = response.escrow_invoice_url;
            this.downloadFile(url);
          }

          this.alertService.success(response.message);
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

  downloadFile(url: string) {
    const a: any = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    a.setAttribute('target', '_blank'); // Set the target attribute to '_blank'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  markAnamaly(obj: any) {
    console.log(obj);
    
   // ev.preventDefault();
    //const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `This action will flag the policy (#${obj.policy_number}) for further attention. Executing this action will not alter the status of the policy or any scheduled tasks associated with it. Would you like to proceed?`, 'Yes', 'No', 'xl').then((res) => {
    //this.confrmSvc.confirm('Are you sure', `This change will not cancel the policy with policy no ${obj.policy_number} and not stop any of its relevant actions. It will be only ${obj.is_anamaly?'mark':'unmark'} as an anomaly in the system. Do you really want to proceed?`, 'Yes', 'No', 'xl').then((res) => {
      if (res) {
        this.apiSvc.post(AppConfig.apiUrl.policy.markAsPolicy, { 'policy_id': obj.policy_id,is_anamaly:obj.is_anamaly?0:1}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getCustomerDetails();
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
        //obj.active_status = previousActiveStatus;
       // this.cdRef.detectChanges();
      }
    })
      .catch(() => { 
        //bj.active_status = previousActiveStatus;  
      });
  }
}
