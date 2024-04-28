import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { checkAccessPermission } from 'src/app/@core/global';
import { AlertService } from 'src/app/@core/services/alert.service';
import { ApiService } from 'src/app/@core/services/api.service';
import { CommonService } from 'src/app/@core/services/common.service';
import { AppConfig } from 'src/app/@utils/const/app.config';

@Component({
  selector: 'app-claim-thank-you',
  templateUrl: './claim-thank-you.component.html',
  styleUrls: ['./claim-thank-you.component.scss']
})
export class ClaimThankYouComponent {
  claim_number: any='';
  claim_id: any='';
  claimDetails:any={};
  public permissionObj: any;
  currentParams:any
  constructor(
    private activatedRoute: ActivatedRoute,
    private apiSvc: ApiService,
    private commonSvc: CommonService,
    private alertService: AlertService,
    private router:Router,
    ){
      this.commonSvc.setTitle('Claim Tank You');
      let currentRoute: any = `claim-management`;
      //let currentRoute: any = this.router.routerState.snapshot.url.split('?')[0].substring(1);
      let permissionObj=checkAccessPermission(currentRoute);
      if (permissionObj) {
        this.permissionObj = permissionObj
        if (!this.permissionObj.view) {
          this.router.navigate(['/unauthorized']);
        } 
      }
      // this.commonSvc.checkAccessPermission(currentRoute).subscribe((permissionObj: any) => {
      //   if (permissionObj) {
      //     this.permissionObj = permissionObj
      //     if (!this.permissionObj.edit) {
      //       this.router.navigate(['/unauthorized']);
      //     }
      //     // Do something with the permission object
      //   } else {
      //     // Handle the case where no permission is found
      //   }
      // });
    this.activatedRoute.paramMap.subscribe((params) => {
      const encodedId: any = params.get('claim_id');
      this.claim_id = atob(decodeURIComponent(encodedId));
    });
  }
  ngOnInit(): void {
    // console.log(this.claim_number,this.claim_id);
    if (this.claim_id) {
      this.getClaimDetails();
    }
  }

  async getClaimDetails() {
    this.apiSvc.get(`${AppConfig.apiUrl.claims.getClaimDetails}/${this.claim_id}`).subscribe({
      next: async (response: any) => {
        if (response.status == 1) {
          this.claimDetails = response?.data;
          console.log(this.claimDetails);
          
        } else if (response.status == 0) {
          this.alertService.error(response.message)
        }
      }
    });
  }
  ngOnDestroy() {
    if (this.currentParams) {
       this.router.navigate([], {
      queryParams: {
        'claim_id': null,
      },
      queryParamsHandling: 'merge'
    })
    }
   
  }
}