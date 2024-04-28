import { Component, TemplateRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { ConfirmationDialogService } from 'src/app/@core/services/confirmation-dialog.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { IconService } from 'src/app/@core/services/icon.service';
import { SharedService } from 'src/app/@core/services/shared.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-escrow-payment',
  templateUrl: './escrow-payment.component.html',
  styleUrls: ['./escrow-payment.component.scss']
})
export class EscrowPaymentComponent {
  paginationObj = {
    first: 0,
    currentPage: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  };
  permissionObj:any;
  searchingvalue: any = ''
  resetSearchInput = false;
  sortField: string = 'created_at'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  escrowList:any=[];
  itemPerPageDropdown = [5, 10, 20, 30, 50, 100, 150, 200];
  viewModalRef?: BsModalRef | null;
  viewObj: any = {};

  constructor(
    private apiSvc: ApiService,
    private fb: UntypedFormBuilder,
    private alertService: AlertService,
    public formBuilder: UntypedFormBuilder,
    private modalService: BsModalService,
    private commonSvc: CommonService,
    private IconService: IconService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mdlSvc: BsModalService,
    private confrmSvc: ConfirmationDialogService,
    private formValidationSvc: FormValidationService,
    private sharedService: SharedService
  ) {
    this.commonSvc.setTitle('Escrow Payments');
    this.activatedRoute.queryParams.subscribe(params => {
      this.paginationObj.currentPage = parseInt(params['page']) || 1;
      this.paginationObj.limit = parseInt(params['limit']) || 50;
      this.paginationObj.first = (this.paginationObj.currentPage - 1) * this.paginationObj.limit || 0;
    });
  //   this.activatedRoute.data.subscribe((data: any) => {
  //     const subModuleDetails = data['subModuleDetails'];
  //     if (subModuleDetails) {
  //       this.sharedService.updateSubmoduleDetails(subModuleDetails);
  //       let combArr = subModuleDetails.permission_details.combination.split(',');
  //       this.permissionObj = {
  //         view: combArr[0] === '1',
  //         add: combArr[1] === '1',
  //         edit: combArr[2] === '1',
  //         delete: combArr[3] === '1'
  //       };
  //     }
  //   });
  let currentRoute:any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
    let permissionObj=checkAccessPermission(currentRoute);
    if (permissionObj) {
      this.permissionObj = permissionObj
      if (!this.permissionObj.view) {
        this.router.navigate(['/unauthorized']);
      } 
    }
   }

  getSearchInputVal(str: string) {
    this.searchingvalue = str
    this.resetSearchInput = true;
    this.commonSvc.resetPagination(this.paginationObj,'/payments-management/escrow-payment');
    this.getEscrowList();
  }
  
  navigateToEditPolicy(policy_id: any) {
    const encodedId = encodeURIComponent(btoa(policy_id));
    this.router.navigate([`/policy-management/edit-policy/${encodedId}`]);
  }

  navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }

  paginate(event: any) {
    this.paginationObj.currentPage = event.page + 1;
    if (this.paginationObj.limit !== event.rows) {
      this.paginationObj.limit = event.rows
    }
    this.router.navigate(['/payments-management/escrow-payment'], {
      queryParams: {
        page: this.paginationObj.currentPage,
        limit: this.paginationObj.limit
      },
      queryParamsHandling: 'merge',
    });
    this.getEscrowList();
  }

  ngOnInit(): void {
    this.getEscrowList();
  }

  getEscrowList(){
      let url = `${AppConfig.apiUrl.payments.getAllPayments}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&paymentType=3`;
      if (this.searchingvalue) {
        url = url + `&search=${this.searchingvalue}`;
      }   
      url = encodeURI(url);
      this.apiSvc.post(url,'').subscribe({
        next: (val: any) => {
          this.escrowList = val?.data;
          this.paginationObj = val?.pagination;
        }
      });
  }


  openViewUserModal(template: TemplateRef<any>, obj: any) {
    this.viewModalRef = this.mdlSvc.show(template, { class: 'modal-lg view-modal', backdrop: 'static' });
    this.viewObj = obj;
  }

  updateSorting(columnName: string) {
    if (columnName === this.sortField) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = columnName;
      this.sortOrder = 'asc';
    }
    this.getEscrowList();
  }

  copyToClipBoard(val: string) {
    navigator.clipboard.writeText(val);
    this.alertService.success('Copied!')
  }

  removeEscrowPayment(payment_id:any){
    this.confrmSvc.confirm('', `Are you sure want to Delete?`, 'Yes', 'No').then((res) => {
    this.apiSvc.post(`${AppConfig.apiUrl.payments.removeEscrowPayment}/${payment_id}`,'').subscribe({
      next:(response:any)=>{
        if (response.status==1) {
          this.alertService.success(response.message || 'payment deleted successfully')
          this.getEscrowList();
        }else{
          this.alertService.error(response.message || 'Something went wrong!')
        }
      }
    })
  })
  }
}