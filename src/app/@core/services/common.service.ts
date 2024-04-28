import { Inject, Injectable, EventEmitter, Output, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SharedService } from './shared.service';
import { ApiService } from './api.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root'
})

export class CommonService {

  constructor(
    private titleService: Title,
    private sharedService: SharedService,
    private apiSvc: ApiService,
    private alertService: AlertService,
    private router: Router
  ) {

  }
  private permissionSubject = new BehaviorSubject<any>(null);

  showAppLogs = true;
  pData: any;
  globalData: any;
  screenWidth: number | undefined;
  screenHeight: number | undefined;
  screenOrientation: string | undefined;
  screenCaptureObj: any = {};

  @Output() componentLoaded = new EventEmitter<boolean>();
  @Output() issubmitClicked = new EventEmitter<any>();
  @Output() currentStep = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])

  log(msg: any) {
    if (this.showAppLogs === true) {
      console.log(msg);
    }
  }
  warn(msg: any) {
    if (this.showAppLogs === true) {
      console.warn(msg);
    }
  }
  error(msg: any) {
    if (this.showAppLogs === true) {
      console.error(msg);
    }
  }

  scrollToTop() {
    window.document.body.scrollTop = 0;
    window.document.documentElement.scrollTop = 0;
  }
  getScreenPosition() {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    return this.screenOrientation = this.screenWidth > this.screenHeight ? 'landscape' : 'portrait';
  }
  getDeviceType() {
    const check = window.navigator.userAgent;
    if (check.match(/Mobile/) && (check.match(/iPhone/) || check.match(/Android/))) {
      console.log('mobile');
      return 'mobile';
    } else if (!check.match(/Mobile/) && (check.match(/Safari/) || check.match(/Chrome/))) {
      console.log('desktop');
      return 'desktop';
    } else {
      console.log('tablet');
      return 'tablet';
    }
  }
  getScreenResolutionBreakPoint(): string {
    const width: number = window.screen.width;
    let screenView = 'xs';
    if (width >= 576 && width < 769) {
      screenView = 'sm';
    } else if (width >= 769 && width < 992) {
      screenView = 'md';
    } else if (width >= 992 && width < 1200) {
      screenView = 'lg';
    } else if (width >= 1200) {
      screenView = 'xl';
    }
    return screenView;
  }
  // getCookieValue(key: string): string | undefined {
  //   const cookie = document.cookie.split(';');
  //   for (let i = 0; i < cookie.length; i++) {

  //     if (cookie[i].trim().startsWith(key)) {
  //       return cookie[i].trim().split(key + '=')[1];
  //     }
  //   }
  // }
  setCookieValue(key: string, value: any) {
    document.cookie = key + '=' + value;
  }

  setUSFormatPhoneNumber(phoneNumber: string) {
    // let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    // // Apply the desired format (XXX) XXX-XXXX
    // let formattedNumber = cleanNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    // Remove all non-digit characters from the input
    if (phoneNumber) {
      let number = phoneNumber.replace(/\D/g, '');
      // Apply the desired phone number format
      if (number.length >= 4) {
       number = `(${number.slice(0, 3)}) ${number.slice(3)}`;
      }
      if (number.length >= 10) {

        number = `${number.slice(0, 9)}-${number.slice(9)}`;
      }
      if (number.length >= 5){
        number = `${number.slice(0, 3)}${number.slice(3)}`;

      }
      return number;
    }
    return null
  }
  validateFileUpload(fileName: any, fileType: any = []) {
    var allowed_extensions = fileType//new Array('jpg', 'jpeg', 'png');
    var file_extension = fileName.split('.').pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
    for (var i = 0; i <= allowed_extensions.length; i++) {
      if (allowed_extensions[i] == file_extension) {
        return true; // valid file extension
      }
    }
    return false;
  }
  convertToNormalPhoneNumber(usPhoneNumber: string) {
    if (usPhoneNumber) {
      // Remove all non-numeric characters from the input phone number
      const normalPhoneNumber = usPhoneNumber.replace(/\D/g, '');
      return normalPhoneNumber;
    }
    return null

  }
  getTimeAgo(phpTimeStamp: string) {
    const current = new Date().getTime();
    const previous = new Date(Date.parse(phpTimeStamp)).getTime();
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
      return Math.round(elapsed / msPerYear) + ' years ago';
    }
  }

  setTitle(title: string) {
    this.titleService.setTitle('First Premier Home Warranty - ' + title);
  }
  
  validatePhotoUpload(fileName: any, fileType: any = []) {
    var allowed_extensions = fileType//new Array('jpg', 'jpeg', 'png');
    var file_extension = fileName.split('.').pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
    for (var i = 0; i <= allowed_extensions.length; i++) {
      if (allowed_extensions[i] == file_extension) {
        return true; // valid file extension
      }
    }
    return false;
  }

  validateZipCode(zipCode: any) {
    return new Promise((resolve, reject) => {
      this.apiSvc.post(AppConfig.apiUrl.locationByZip, { zip: zipCode.toString() }).subscribe({
        next: (response: any) => {
          resolve(response)
        },
        error: (er) => {
          reject(er)
        },
        complete: () => {
        }
      });
    });
  }

  checkAccessPermission(currentRoute: any): Observable<any>  {
     this.sharedService.sharedUserData$.subscribe((response: any) => {
      if (response.data.accessable_module_submodules) {
        var result: any = _.chain(response.data.accessable_module_submodules)
          .map('submodules') // pluck all elements from data
          .flatten() // flatten the elements into a single array
          .filter({ route_path: currentRoute }) // extract elements with a route_path of currentRoute
          .value();
        if (result.length > 0) {
          this.sharedService.updateSubmoduleDetails(result);
          let combArr = result[0].permission_details.combination.split(',');
          let permissionObj = {
            view: combArr[0] === '1',
            add: combArr[1] === '1',
            edit: combArr[2] === '1',
            delete: combArr[3] === '1'
          }
          this.permissionSubject.next(permissionObj);

        } else {
          this.router.navigate(['/unauthorized']); // Adjust to your error route
          this.permissionSubject.next(null);

          // If no match is found, navigate to an error page or handle the error as needed
        }
      } else {
        this.permissionSubject.next(null);
      }
    })
    return this.permissionSubject.asObservable();
  }
  getPermission() {
    return this.permissionSubject.asObservable();
  }
  resetPagination(paginationObj:any,routeName='') {
    if (!paginationObj) {
      return
    }
    paginationObj.first =0
    paginationObj.currentPage =1
    paginationObj.limit =50
    if (routeName) {
      this.router.navigate([routeName], {
        queryParams: {
          page: paginationObj.currentPage,
          limit: paginationObj.limit
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  getCardType(cardNumber:any) {
    if (/^5[1-5]/.test(cardNumber)) {
      return "Mastercard";
    } else if (/^4/.test(cardNumber)) {
      return "Visa";
    } else if (/^3[47]/.test(cardNumber)) {
      return 'Amex';
    } else if (/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(cardNumber)) {
      return 'Discover';
    } else if (/^3(?:0[0-5]|[68][0-9])[0-9]{10}$/.test(cardNumber)) {
      return 'Diners Club';
    } else if (/^(?:2131|1800|35\d{2})\d{11}$/.test(cardNumber)) {
      return 'JCB';
    } else {
      return 'Unknown';
    }
  }
}
