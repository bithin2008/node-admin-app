import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-policy-thank-you',
  templateUrl: './policy-thank-you.component.html',
  styleUrls: ['./policy-thank-you.component.scss']
})
export class PolicyThankYouComponent {
  policyDetails:any
  currentParams:any
  constructor(
    private commonSvc:CommonService,
    private apiSvc: ApiService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private router :Router
    ){
    this.commonSvc.setTitle('Policy Management');

    this.activatedRoute.queryParams.subscribe(async(params: any) => {
      if (params) {
        this.currentParams=params
        let policy_number=params?.policy_number;
        if (policy_number) {
         let response:any= await this.getPolicyDetails(policy_number);
         if (response.status==1) {
          this.policyDetails=response.data
          
          if (!this.policyDetails) {
            this.alertService.error(`Policy Details Not Found`)
            this.router.navigate(['/policy-management'])

          }else{
          }
         }
        }else{
        
        }
      
      }
    });
  }

  getPolicyDetails(policy_number:any) {
    return new Promise<void>((resolve, reject) => {
      this.apiSvc.post(`${AppConfig.apiUrl.policy.getPolicyDetails}/${policy_number}`, '').subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (err) => {
          reject(err)
        },
      })
    })
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
}
