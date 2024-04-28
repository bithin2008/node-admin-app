import { Component, OnInit, OnDestroy,ChangeDetectorRef  } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/@core/services/alert.service';
import { CommonService } from '../@core/services/common.service';
import { FormValidationService } from '../@core/services/form-validation.service';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ApiService } from '../@core/services/api.service';
import { Router } from '@angular/router';
import { SharedService } from '../@core/services/shared.service';
import * as moment from 'moment';
declare var WebTour: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  public wt = new WebTour();
  data: any;
  data2: any;
  linedata: any;
  linedata2: any;
  options: any;
  options2: any;
  lineoptions: any;
  lineoptions2: any;
  userRole:any= AppConfig.userRole
  loggedInUserObj:any
  sortField: string = 'created_at'; // Default sorting field
  sortOrder: string = 'DESC'; // Default sorting order
  currentYear:any=new Date().getFullYear()
  serviceYear:any=this.currentYear;
  selectedYear:any=this.currentYear;
  paginationObj = {
    first: 0,
    // The number of elements in the page
    limit: 10,
    // The total number of elements
    total: 10,
    // The total number of pages
    totalPages: 3,
    // The current page number
    currentPage: 1,
  };
  documentStyle:any
  policyList = [] as any;
  policyCountDetails = [] as any;
  cockPitData:any = [];
  serviceChartData:any = [];
  revenueChartData:any = [];
  modelDate: Date = new Date();
  currentMonth=this.modelDate.getMonth()
  defaultDateRange: Date[] = [
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    new Date()
  ];
  defaultCockpitDateRange: Date[] = [
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    new Date()
  ];
  topFiveStateRange: Date[] = [
    new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
    new Date()
  ];
  roleBasedView={
    totalPolicy:false,
    totalServiceRequest:false,
    latestSalesReport:false,
    cockpitView:false,
    revenueChart:false,
    serviceRequestChart:false,
    sateWiseSalesChart:false,
    onlineVsSalesManSalesChart:false
  }as any
  constructor(
    private apiSvc: ApiService,
    private commonSvc: CommonService,
    private alertService: AlertService,
    private shrdSvc: SharedService,
    private formValidationSvc: FormValidationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.commonSvc.setTitle('Dashboard');
    this.shrdSvc.sharedUserData$.subscribe((response: any) => {
     // let response:any= localStorage.getItem('access_data');
      //response=JSON.parse(response);
      if (response.data) {
        this.loggedInUserObj=response.data
       this.getAuthorizationCondition(response.data.user_role_id)
      } 
    })
  }

  ngOnInit(): void {
    this.getPolicyDetails()
    this.serviceYearChange(this.serviceYear)
    this.webVsBackendChange(this.selectedYear)
    this.documentStyle = getComputedStyle(document.documentElement);
    const textColor = this.documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');
    this.data = {
      labels: ['July', 'August', 'September', 'October'],
      datasets: [
        {
          label: 'Scheduled',
          backgroundColor: this.documentStyle.getPropertyValue('--blue-500'),
          borderColor: this.documentStyle.getPropertyValue('--blue-500'),
          data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: 'Failed',
          backgroundColor: this.documentStyle.getPropertyValue('--yellow-500'),
          borderColor: this.documentStyle.getPropertyValue('--yellow-500'),
          data: [28, 48, 40, 19, 86, 27, 90]
        }
      ]
    };

    this.data2 = {
      labels: ['July', 'August', 'September', 'October'],
      datasets: [
        {
          label: 'Texas',
          backgroundColor: '#0081a7',
          borderColor: '#0081a7',
          data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: 'New York',
          backgroundColor: '#00afb9',
          borderColor: '#00afb9',
          data: [28, 48, 40, 19, 86, 27, 90]
        },
        {
          label: 'Florida',
          backgroundColor: '#fff3b0',
          borderColor: '#fff3b0',
          data: [10, 75, 17,54, 35, 75, 46]
        },
        {
          label: 'Alaska',
          backgroundColor: '#fed9b7',
          borderColor: '#fed9b7',
          data: [25, 14, 5, 45, 78, 35, 27]
        },
        {
          label: 'New Jersey',
          backgroundColor: '#f07167',
          borderColor: '#f07167',
          data: [23, 56, 78,22, 59, 63, 40]
        }
      ]
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          // max:250,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }

      }
    };

    this.options2 = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }

      }
    };

    this.linedata = {
      labels: ['July', 'August', 'September', 'October'],
      datasets: [
        {
          label: 'Policy',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: this.documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4
        },
        {
          label: 'Claim',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderColor: this.documentStyle.getPropertyValue('--pink-500'),
          tension: 0.4
        }
      ]
    };

    this.lineoptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

    this.linedata2 = {
      labels: ['May', 'June', 'July', 'August', 'September', 'October'],
      datasets: [
        {
          label: 'Sales Representative',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: '#82cedf',
          tension: 0.4
        },
        {
          label: 'Sales',
          data: [28, 48, 40, 19, 86, 27, 90],
          fill: false,
          borderColor: '#7d7e9f',
          tension: 0.4
        }
      ]
    };

    this.lineoptions2 = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };

   //this.formValidationSvc.forms();
  }

  ngOnDestroy() {
    this.wt.stop()
  }
  // Tour //
  webTour() {
    var steps = [
      {
        content: `<div class="text-center p-3 flow-rootx">
                      <h3 class="text-center h3 fw--b c--blak">Hi, Welcome to your portal</h3>
                      <p class="h7">Let's start a short tour to make you understand your elements</p>
                  </div>`,
        width: '500px'
      },
      {
        element: '#panel',
        title: 'Sidebar Panel',
        content: 'Hi, this is your sidebar panel, you can navigate to pages by clicking links below.',
        placement: 'right-start',
      },
      {
        element: '#message',
        title: 'Message Inbox',
        content: 'Hi, this is your message box, new messages will come here.',
        placement: 'left-start',
      },
      {
        element: '#notification',
        title: 'Notification',
        content: 'Hi, this is your notification box, new activities will show here.',
        placement: 'left-start',
      }, {
        element: '#profile',
        title: 'Profile',
        content: 'Hi, this is your profile, you can edit, logout even you can customize your mode.',
        placement: 'left-start',
      }, {
        element: '#table',
        title: 'Table',
        content: 'Hi, this is your table, lists will be shown here.',
        placement: 'top-start',
      }, {
        element: '#table-row',
        title: 'Table Row',
        content: 'Hi, this is your table row, you can edit every columns of each table in this portal by double pressing it.',
        placement: 'top-start',
      },
      {
        content: `<div class="text-center p-3">
                  <div class="center">
                  <div class="thumb pi pi-thumbs-up-fill"></div>
                  <div class="circle-wrap">
                    <div class="circle-lg"></div>
                  </div>
                  <div class="dots-wrap">
                    <div class="dot dot--t"></div>
                    <div class="dot dot--tr"></div>
                    <div class="dot dot--br"></div>
                    <div class="dot dot--b"></div>
                    <div class="dot dot--bl"></div>
                    <div class="dot dot--tl"></div>
                  </div>
                </div>
                        <h3 class="h4">That's the end of our tour! Enjoy your portal.</h3>
                    </div>`,
        width: '500px'
      }]
    this.wt.setSteps(steps);
    if (localStorage.getItem("isTourCompleted") != "yes")
      this.wt.start();
   
    // Select the target node
    const targetNode = document.body;

    // Create a new instance of MutationObserver
    const observer = new MutationObserver((mutationsList) => {
      // Check each mutation for removed nodes
      for (const mutation of mutationsList) {
        const removedNodes: any = mutation.removedNodes;

        // Iterate over removed nodes and check if any of them have the desired class name
        for (const node of removedNodes) {
          if (node.classList && node.classList.contains('wt-overlay')) {
            // Element with class name "wt-overlay" has been removed
            localStorage.setItem("isTourCompleted", "yes")
            // Perform any desired actions here
          }
        }
      }
    });

    // Configuration options for the observer
    const config = { childList: true, subtree: true };

    // Start observing the target node for mutations
    observer.observe(targetNode, config);
  }



  // ---------------------------------------//--------------------------------------------------//--------------------------------//--------------------------
  getLatest10(type:any){

  let today= moment().format("YYYY-MM-DD")
  let api =`${AppConfig.apiUrl.policy.getAllPolicies}?page=${this.paginationObj.currentPage}&limit=${this.paginationObj.limit}&sortField=${this.sortField}&sortOrder=${this.sortOrder}&source=${type}`
  if(AppConfig.userRole.sales_representative==this.loggedInUserObj.user_role_id){
    api=api+`&created_from=${today}&created_to=${today}&created_by=${this.loggedInUserObj.org_user_id}`
  }
    this.apiSvc.post(api, '').subscribe({
      next: (response: any) => {
        this.paginationObj = response?.pagination;
        this.policyList = response?.data;
      }
    });
  }

  getPolicyDetails(){
  let api =`${AppConfig.apiUrl.dashboard.getDashboardDetails}`
  let data={serviceYear:this.serviceYear}
    this.apiSvc.post(api, data).subscribe({
      next: (response: any) => {
        this.policyCountDetails = response?.data;
      }
    });
  }

  serviceYearChange(year:any){
  let api =`${AppConfig.apiUrl.dashboard.getServiceRequest}`
  let data={serviceYear:year}
    this.apiSvc.post(api, data).subscribe({
      next: (response: any) => {
        this.serviceChartData = response?.data;
        this.linedata = {
          labels: this.serviceChartData.months,
          datasets: [
            {
              label: 'Policy',
              data: this.serviceChartData.policy,
              fill: false,
              
              tension: 0.4
            },
            {
              label: 'Claim',
              data: this.serviceChartData.claim,
              fill: false,
              tension: 0.4
            }
          ]
        };
      }
    });
  }

  selectCockpitDateRange(event:any){
    const selectedStartDate: Date = event[0]; // Assuming the date range picker returns an array with start and end dates
    const selectedEndDate: Date = event[1];
    let api =`${AppConfig.apiUrl.dashboard.getDashboardCockpit}`
      let data={
        "startDate":selectedStartDate,
        "endDate":selectedEndDate
      }
    this.apiSvc.post(api, data).subscribe({
        next: (response: any) => {
          this.cockPitData=response?.data
        }
    })
  }

  selectCustomDateRange(event:any){
    const selectedStartDate: Date = event[0]; // Assuming the date range picker returns an array with start and end dates
    const selectedEndDate: Date = event[1];

    const monthDiff = (selectedEndDate.getFullYear() - selectedStartDate.getFullYear()) * 12 +
      (selectedEndDate.getMonth() - selectedStartDate.getMonth()); 
    if (monthDiff < 6) {
      let api =`${AppConfig.apiUrl.dashboard.getRevenueData}`
      let data={
        "startDate":selectedStartDate,
        "endDate":selectedEndDate
      }
        this.apiSvc.post(api, data).subscribe({
          next: (response: any) => {
            this.revenueChartData = response?.data;
            this.data = {
              labels: this.revenueChartData.month,
              datasets: [
                {
                  label: 'Success',
                  backgroundColor: this.documentStyle.getPropertyValue('--blue-500'),
                  borderColor: this.documentStyle.getPropertyValue('--blue-500'),
                  data: this.revenueChartData.success
                },
                {
                  label: 'Failed',
                  backgroundColor: this.documentStyle.getPropertyValue('--yellow-500'),
                  borderColor: this.documentStyle.getPropertyValue('--yellow-500'),
                  data: this.revenueChartData.failed
                },
                {
                  label: 'Pending',
                  backgroundColor: this.documentStyle.getPropertyValue('--red-300'),
                  borderColor: this.documentStyle.getPropertyValue('--red-300'),
                  data: this.revenueChartData.pending
                }
              ]
            };
          }})
      
    }else{
      this.alertService.error('Maximum allowed gap is six months')
      this.defaultDateRange = [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date()
      ];
      this.cdr.detectChanges();
    }
   }

  topFiveStateDateRange(event:any){
    const selectedStartDate: Date = event[0]; // Assuming the date range picker returns an array with start and end dates
    const selectedEndDate: Date = event[1];
  
    const monthDiff = (selectedEndDate.getFullYear() - selectedStartDate.getFullYear()) * 12 +
      (selectedEndDate.getMonth() - selectedStartDate.getMonth()); 
      //console.log(monthDiff);
      
    if (monthDiff < 5) {
      let api =`${AppConfig.apiUrl.dashboard.getTopFiveStateSales}`
      let data={
        "startDate":selectedStartDate,
        "endDate":selectedEndDate
      }
        this.apiSvc.post(api, data).subscribe({
          next: (response: any) => {
            //this.revenueChartData = response?.data;
            this.data2 = {
              labels: response?.data.months,
              datasets: response?.data.stateData
            };
          }})
      
    }else{
      this.alertService.error('Maximum allowed gap is six months')
      this.topFiveStateRange = [
        new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
        new Date()
      ];
      this.cdr.detectChanges();
    }
   }
   webVsBackendChange(event:any){
    let api =`${AppConfig.apiUrl.dashboard.getWebsiteVsBackend}`
    let data={selectedYear:event}
    this.apiSvc.post(api, data).subscribe({
      next: (response: any) => {
        this.serviceChartData = response?.data;
        this.linedata2 = {
          labels: response?.data.months,
          datasets: [
            {
              label: 'Website',
              data: response?.data.website,
              fill: false,
              
              tension: 0.4
            },
            {
              label: 'Backend',
              data: response?.data.backend,
              fill: false,
              tension: 0.4
            }
          ]
        };
        setTimeout(() => {
          this.formValidationSvc.forms();
        }, 100);
      }
    });
   }
   navigateToCustomerDetails(customer_id:any){
    const encodedId = encodeURIComponent(btoa(customer_id));
    this.router.navigate([`/customer-management/customer-details/${encodedId}`]);
  }
  getAuthorizationCondition = (user_role_id:any) => {
     
    switch (user_role_id) {
      case this.userRole.admin:
        // Admin can access all data, no need to add any specific condition
        for (const prop in this.roleBasedView) {
          this.roleBasedView[prop] = true;
        }
        this.getLatest10(1)

        break;
  
      case this.userRole.sales_manager:
        // Sales manager can access data of sales users data
        this.roleBasedView.totalPolicy = true;
        this.roleBasedView.latestSalesReport = true;
        this.roleBasedView.revenueChart=true
        this.roleBasedView.sateWiseSalesChart=true
        this.roleBasedView.onlineVsSalesManSalesChart=true
        this.getLatest10(1)

        break;
      case  this.userRole.sales_representative:
        // Salesman can access data created by themselves
        this.roleBasedView.totalPolicy = true;
        this.roleBasedView.latestSalesReport = true;
        this.roleBasedView.revenueChart=true
        this.roleBasedView.sateWiseSalesChart=true

        this.getLatest10(1)
        break;
      case  this.userRole.claim_representative:
        // Salesman can access data created by themselves
        this.roleBasedView.totalServiceRequest = true;
        this.roleBasedView.serviceRequestChart = true;
        this.roleBasedView.cockpitView = true;
        this.getLatest10(1)
        break;
  
      // Add more cases for other roles if needed
  
      default:
        // Default condition for unknown roles
        break;
    }
  
  //  return condition;
  };
}
