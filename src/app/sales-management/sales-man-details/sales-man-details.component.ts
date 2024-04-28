import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
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
  selector: 'app-sales-man-details',
  templateUrl: './sales-man-details.component.html',
  styleUrls: ['./sales-man-details.component.scss']
})
export class SalesManDetailsComponent {
  claimViewEleRef?: BsModalRef | null;
  paymenViewEleRef?: BsModalRef | null;
  permissionObj: any;
  salesmanId: any;
  salesmanDetails: any;
  policySaleList:any=[];
  claimTicketStatusList:any=[];
  paymentList:any=[];
  policyNotes:any=[];
  totalPolicyAmount:any=0;
  claimCount:any=0;
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
    private cd:ChangeDetectorRef

) {
    this.commonSvc.setTitle('Salesman Details');
    let currentRoute= 'sales-management';
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
    // this.commonSvc.checkAccessPermission('sales-management').subscribe((permissionObj: any) => {
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
      const encodedId: any = params.get('salesman_id');
      this.salesmanId = atob(decodeURIComponent(encodedId)); 
    });
  }

  ngOnInit() {
    this.getOrgUserList(); 
    this.getClaimTicketStatus(); 
  }

  getOrgUserList() {
    this.apiSvc.get(`${AppConfig.apiUrl.orgAdmin.getSalesmanDetails}/${this.salesmanId}`).subscribe({
      next: (response: any) => {
        this.salesmanDetails = response.data;
        this.policySaleList=response.data?.policy_list;
        this.policyNotes=response.policyNote;
        if (this.policyNotes.length>0) {
          this.policyNotes?.forEach((item:any,i:any)=>{
            let tableJson={}
            let Name=item?.assignee_user_info?item?.assignee_user_info ?.first_name+' '+item?.assignee_user_info?.last_name:'N/A'
            tableJson = {
              "#":i+1,
              "Policy Number":item.policy_number,
              "Notes":item?.notes, 
              "Assigned To":Name,
              "customer_id":item.customer_id,
              "Created By":item.created_user_info.first_name+' '+item.created_user_info.last_name,
              "Created On":moment(item.created_at).format('YYYY-MM-DD'),
              "is_anamaly":this.policySaleList.find((el:any)=>el.policy_number==item.policy_number)?.is_anamaly
              // "Updated On":moment(item.updated_at).format('YYYY-MM-DD')
            }
            this.policyNotesTableData.push(tableJson)
          })
        }
    

        this.totalPolicyAmount= this.policySaleList?.reduce((sum:any, policy:any) => sum + policy.net_amount, 0);

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
    obj?.claim_details?.forEach((item:any,i:any) => {
      
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
    obj?.payment_details?.forEach((item:any,i:any) => {
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
  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
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
                this.getOrgUserList();
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
