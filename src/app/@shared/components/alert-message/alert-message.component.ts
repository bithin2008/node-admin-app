import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../@core/services/alert.service';
@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss']
})
export class AlertMessageComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription;
  message: any;
  alertList: any = [];

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.subscription = this.alertService.getAlert()
      .subscribe(message => {
        message.id = Math.floor(Math.random() * (999 - 100 + 1) + 100);

        this.alertList.push(message);

        if (this.alertList.length > 0) {
          this.alertList.forEach((element: any) => {

            switch (element && element.type) {
              case 'success':
                element.icon = 'success';
                break;
              case 'error':
                element.icon = 'error';
                break;
              case 'info':
                element.icon = 'info';
                break;
              case 'warning':
                element.icon = 'warning';
                break;
            }
            setTimeout(() => {
              element.cssClass = 'show';
            }, 200);
            setTimeout(() => {
              this.dismissAlert(element)
            }, 5000)
          });
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  dismissAlert(obj: any) {
    this.alertList.forEach((element: any, index: number) => {
      if (element.id == obj.id) {
        this.alertList.splice(index, 1);
      }
    });
  }
}
