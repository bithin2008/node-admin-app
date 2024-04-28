import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-real-estate-professional-details',
  templateUrl: './real-estate-professional-details.component.html',
  styleUrls: ['./real-estate-professional-details.component.scss']
})
export class RealEstateProfessionalDetailsComponent {
  claimViewEleRef?: BsModalRef | null;
  paymenViewEleRef?: BsModalRef | null;
  realtor_id:any;
  permissionObj: any;
  realtorDetails:any={};
  policySaleList:any=[];
  policyNotes:any=[];
  claimTicketStatusList:any=[];
  paymentList:any=[];
  totalPolicyAmount:any=0;
  claimCount:any=0;
  loading: boolean = false;
  totalPremiumPaidAmount: any=0;
  totalPremiumAmount: any=0;
  //------------
  tableHeaders:any = [];
  tableData:any = [];
  //------------
  policyNotesTableHeaders = [
    "#",
    "Policy Number",
    "Notes", 
    "Assigned To", 
    "Created By", 
    "Created On", 
    "Updated On"
  ]
  policyNotesTableData:any = [];

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
) {
    this.commonSvc.setTitle('Real Estate Professional Details');
    let currentRoute: any = 'real-estate-professionals-management';
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // this.commonSvc.checkAccessPermission('real-estate-professionals-management').subscribe((permissionObj: any) => {
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
      const encodedId: any = params.get('realtor_id');
      this.realtor_id = atob(decodeURIComponent(encodedId)); 
    });
  }


  //get-realtor-details/:realtor_id

  ngOnInit() {
    this.getRealtorDetails(); 
    this.getClaimTicketStatus(); 
  }

  getRealtorDetails() {
    this.apiSvc.post(`${AppConfig.apiUrl.realEstate.getRealEstateProfessionalsDetails}/${this.realtor_id}`,{}).subscribe({
      next: (response: any) => {
        this.realtorDetails = response.data;
        this.policySaleList=response.data?.created_policies.filter((item:any)=>item.create_user_type==3);
       
        this.totalPolicyAmount= this.policySaleList?.reduce((sum:any, policy:any) => sum + policy.net_amount, 0);
        this.claimCount=this.policySaleList?.reduce((sum:any, policy:any) => sum + policy.claim_list?.length, 0);
    
        this.policySaleList.map((item:any)=>{
          this.totalPremiumAmount = item.payment_details?.reduce((accumulator: number, currentValue: any) => {
            return accumulator + (currentValue.payment_status != 1 ? currentValue.amount ? parseFloat(currentValue.amount) : 0 : 0);
          }, 0);
          this.totalPremiumPaidAmount = item.payment_details?.reduce((accumulator: number, currentValue: any) => {
            return accumulator + (currentValue.payment_status == 1 ? currentValue.amount ? parseFloat(currentValue.amount) : 0 : 0);
          }, 0);
        })
       }
   })
  }

  closeClaimViewModal(){
    this.claimViewEleRef?.hide();
  }
  
  openClaimViewModal (template: TemplateRef<any>,obj:any=null) {
   
    let tableJson={}
    this.tableData=[]
    this.tableHeaders = [
      "#","Claim Ticket Status","Claim No.","Product Name","Issue Details",
      "Priority","Plan Name","Policy Number","Name","Created On","Updated On"
    ]
    obj?.claim_list.forEach((item:any,i:any) => { 
      tableJson = {
        "#":i+1,
        "Claim Ticket Status": this.claimTicketStatusList.find((el:any)=>el.claim_ticket_statuses_id==item.claim_ticket_statuses_id)?.ticket_status,//item.claim_ticket_statuses_id ,
        "Claim No.":item.ticket_no,
        "Product Name":obj?.policy_product_list.find((el:any)=>el.product_id==item.product_id)?.product_details?.product_name,
        "Issue Details":item.issue_details,
        "Priority":item.priority,
        "Plan Name":obj.plan_details?.plan_name,
        "Policy Number":obj.policy_number,
        "Name":obj.first_name+' '+obj.last_name,
        "Created On":moment(item.created_at).format('YYYY-MM-DD'),
        "Updated On":moment(item.updated_at).format('YYYY-MM-DD')
      }
      this.tableData.push(tableJson)
    });

    this.claimViewEleRef = this.mdlSvc.show(template, { class: 'modal-xl view-modal', backdrop: 'static' });
  };



  closePaymentViewModal(){
    this.paymenViewEleRef?.hide();
  }

  openPaymentsViewModal (template: TemplateRef<any>,obj:any=null) {
    this.tableHeaders = [
      "#","Policy Number","Policy Status","Recurring Type","Payment Status",
      "Amount","Payment type","Transaction ID","Created On","Updated On"
    ]
    let tableJson={}
    this.tableData=[]
    obj?.payment_details.forEach((item:any,i:any) => {
      tableJson = {
        "#":i+1,
        "Policy Number":obj.policy_number,
        "Policy Status":obj.policy_status_details.status_name,
        "Recurring Type":item.recurring_type==1?'Monthly':item?.recurring_type==0?'Yearly':'N/A',
        "Payment Status":item.payment_status_details?.status_name,
        "Amount":item.amount,
        "Payment type":item.payment_type==1?'CREDIT CARD':item.payment_type==2?'BANK ACH':item.payment_type==3?'Escrow':item.payment_type==4?'Do Not Charge':'N/A',
        "Transaction ID":item.transaction_no?item.transaction_no:'N/A',
        // "Created By":item.created_by,
        "Created On":moment(item.created_at).format('YYYY-MM-DD'),
        "Updated On":moment(item.updated_at).format('YYYY-MM-DD')
      }
      this.tableData.push(tableJson)
    });
    this.paymenViewEleRef = this.mdlSvc.show(template, { class: 'modal-xl view-modal', backdrop: 'static' });
  };

  getClaimTicketStatus(){
    this.apiSvc.get(`${AppConfig.apiUrl.claims.getAllClaimTicketStatuses}?active_status=1`).subscribe({
      next:(response:any)=>{
        if (response.status==1) {
           this.claimTicketStatusList=response?.data
        }
      }
    })
  }
  copyToClipBoard(val: string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }

  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }

  changeActivationStatus(ev: any, obj: any) {
    ev.preventDefault();
    const previousActiveStatus = obj.active_status;
    this.confrmSvc.confirm('Are you sure', `Do you really want to ${ev.target.checked ? 'active' : 'inactive'} ${obj.contact_name} realestate professional ?`, 'Yes', 'No', 'lg').then((res) => {
      if (res) {
        this.apiSvc.put(`${AppConfig.apiUrl.realEstate.toggleActiveStatus}/${obj.realestate_professional_id}`, { 'activeStatus': obj.active_status ? 0 : 1 }).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getRealtorDetails();
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
        this.cdRef.detectChanges();
      }
    })
      .catch(() => { obj.active_status = previousActiveStatus; this.cdRef.detectChanges(); });
  }

  markAnamaly(obj: any) {
    console.log(obj);
    this.confrmSvc.confirm('Are you sure', `This action will flag the policy (#${obj.policy_number}) for further attention. Executing this action will not alter the status of the policy or any scheduled tasks associated with it. Would you like to proceed?`, 'Yes', 'No', 'xl').then((res) => {
      if (res) {
        this.apiSvc.post(AppConfig.apiUrl.policy.markAsPolicy, { 'policy_id': obj.policy_id,is_anamaly:obj.is_anamaly?0:1}).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertService.success(response.message);
              setTimeout(() => {
                this.getRealtorDetails();
              }, 250);
            } else {
              this.alertService.error(response.message);
            }
          },
          error: () => {
            //this.loading = false;
          },
          complete: () => {
           // this.loading = false;
          }
        });
      } 
    })
      .catch(() => {});
  }
}
