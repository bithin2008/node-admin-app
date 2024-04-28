import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import * as moment from 'moment';
@Component({
  selector: 'app-add-edit-addon-category',
  templateUrl: './add-edit-addon-category.component.html',
  styleUrls: ['./add-edit-addon-category.component.scss']
})
export class AddEditAddonCategoryComponent {
  addonCategoryId: any = '';
  submitted = false;
  loading = false;
  addonCategoryDetails: any = {};
  addOnCateggoryList:any=[];

  addonCategoryForm = this.fb.group({
    addonCategoryName: ['', [Validators.required, this.validator.notEmpty, Validators.minLength(3), Validators.maxLength(50), this.validator.validName]],
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
      this.addonCategoryId = params['addon_category_id'];
      if (this.addonCategoryId) {
        this.commonSvc.setTitle('Edit Addon Category');
      } else {
        this.commonSvc.setTitle('Add Addon Category');
      }
    });
  }

  ngOnInit(): void {
   
    if (this.addonCategoryId) {
      this.getAddOnCategoryId()
    }else{
      this.getAddOnCategory()
    }
  }

  getAddOnCategory(){
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

  getAddOnCategoryId() {
    this.loading = true;
    this.apiSvc.get(`${AppConfig.apiUrl.getAddonCategoryById}/${this.addonCategoryId}`).subscribe({
      next: (res: any) => {
        this.addonCategoryForm.patchValue({
          addonCategoryName: res?.data.category_name,
          activeStatus: res?.data.active_status.toString(),  
        });
        this.loading = false;       
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  } 

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    if (this.addonCategoryForm.valid) {
      if (this.addonCategoryId) {
        this.apiSvc.put(`${AppConfig.apiUrl.updateAddonCategory}/${this.addonCategoryId}`, this.addonCategoryForm.value).subscribe({
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
        this.apiSvc.post(AppConfig.apiUrl.createAddonCategory, this.addonCategoryForm.value).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.alertSvc.success(response.message);
              this.addonCategoryForm.reset();
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
      this.validator.validateAllFormFields(this.addonCategoryForm);
    }
  }
}
