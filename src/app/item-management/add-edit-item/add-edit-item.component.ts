import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { min } from 'lodash';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import * as moment from 'moment';
@Component({
  selector: 'app-add-edit-item',
  templateUrl: './add-edit-item.component.html',
  styleUrls: ['./add-edit-item.component.scss']
})
export class AddEditItemComponent {
  itemId: any = '';
  submitted = false;
  loading = false;
  locationDetails: any = {};
  itemDetails: any = {};
  addOnCateggoryList:any=[];

  itemForm = this.fb.group({
    itemCategories: ['1', [Validators.required]],
    addonCategoryId: [''],
    itemName: ['', [Validators.required, this.validator.notEmpty, Validators.minLength(3), Validators.maxLength(50), this.validator.validName]],
    itemType: ['1', [Validators.required]],
    maxMonthlyPrice: ['', [Validators.required, this.validator.numericOnly]],
    maxYearlyPrice: ['', [Validators.required, this.validator.numericOnly]],
    minMonthlyPrice: ['', [Validators.required, this.validator.numericOnly]],
    minYearlyPrice: ['', [Validators.required, this.validator.numericOnly]],   
    deletionPrice: ['', [Validators.required, this.validator.numericOnly]],
    activeStatus: ['1', Validators.required],
  });


  constructor(
    private fb: UntypedFormBuilder,
    private commonSvc: CommonService,
    private validator: FormValidationService,
    private apiSvc: ApiService,
    private router: Router,
    private actvRoute: ActivatedRoute,
    private alertSvc: AlertService) {

    this.actvRoute.params.subscribe(params => {
      this.itemId = params['item_id'];
      if (this.itemId) {
        this.commonSvc.setTitle('Edit Item');
      } else {
        this.commonSvc.setTitle('Add Item');
      }
    });
  }

  ngOnInit(): void {
    this.getAddOnCategoryId()
    if (this.itemId) {
      this.getItemById()
    }
  }

  getAddOnCategoryId(){
    this.loading = true;
    this.apiSvc.get(`${AppConfig.apiUrl.getAddonCategory}`).subscribe({
      next: (val: any) => {
        this.addOnCateggoryList = val?.data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }

  changeItemType(ev:any){
       if(ev.target.value==0){
        this.itemForm.controls['addonCategoryId'].setValidators([Validators.required])
        this.itemForm.controls['addonCategoryId'].updateValueAndValidity()
       }else{
        this.itemForm.controls['addonCategoryId'].clearValidators();
        this.itemForm.controls['addonCategoryId'].updateValueAndValidity();
       }
  }

  getItemById() {
    this.loading = true;
    this.apiSvc.get(`${AppConfig.apiUrl.getItemById}/${this.itemId}`).subscribe({
      next: (res: any) => {
        //  this.itemDetails = res?.data;

        let activationExpiryTime= moment.duration(moment(res?.data.access_activation_exp_time).diff(moment(res?.data.updated_at))).asMinutes();
        let loginOTPCreated= moment.duration(moment(res?.data.login_otp_created_at).diff(moment(res?.data.updated_at))).asMinutes();


        //let activationExpiryTime= moment.duration(moment(res?.data.access_activation_exp_time).diff(moment(res?.data.updated_at)));
        this.itemForm.patchValue({
          itemCategories: res?.data.item_categories,
          addonCategoryId: res?.data.addon_category_id,
          itemName: res?.data.item_name,
          itemType: res?.data.item_type.toString(),
          maxMonthlyPrice: res?.data.max_monthly_price,
          maxYearlyPrice: res?.data.max_yearly_price,
          minMonthlyPrice: res?.data.min_monthly_price,
          minYearlyPrice: res?.data.min_yearly_price,
          deletionPrice: res?.data.deletion_price,
          activeStatus: res?.data.active_status.toString(),  
        });
        setTimeout(() => {
          // this.itemForm.get('activeStatus').patchValue(res?.data.active_status);  
        }, 1000);

        this.loading = false;
        console.log('this.itemDetails', this.itemDetails);
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  } 

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.itemForm.valid) {
      if (this.itemId) {
        this.apiSvc.put(`${AppConfig.apiUrl.updateItem}/${this.itemId}`, this.itemForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.loading = false;
            }else{
              this.alertSvc.error(response.message);
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
        this.apiSvc.post(AppConfig.apiUrl.addItem, this.itemForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.itemForm.reset();
              this.loading = false;
            }else{
              this.alertSvc.error(response.message);
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
    } else {
      this.loading = false;
      this.validator.validateAllFormFields(this.itemForm);
    }
  }


}
