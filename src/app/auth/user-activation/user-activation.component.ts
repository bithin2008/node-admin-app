import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AuthService } from 'src/app/@core/services/auth.service';

@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss']
})
export class UserActivationComponent {
  userActivationToken: any = '';
  userActivationMessage: any = '';
  userActivationStatus:boolean=false
  constructor(
    private activatedRoute: ActivatedRoute,
    private authSvc: AuthService,
    private router:Router
  ) {
    // subscribe to router event 
    this.activatedRoute.params.subscribe((params: Params) => {     
      this.userActivationToken = params['usertoken'];
      this.activateUser()
    });

  }

  activateUser() {
    this.authSvc.validateUserToken(this.userActivationToken).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.userActivationMessage = response.message;
          this.userActivationStatus=true;
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login')
          }, 3000);
        }else {
          this.userActivationMessage = response.message;
        }
      },
      error: () => { },
      complete: () => { }
    });
  }
}
