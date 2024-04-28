import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationService } from 'src/app/@core/services/navigation.service';
import { CommonService } from '../@core/services/common.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
declare var bootstrap: any;
@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  styleUrls: ['./elements.component.scss']
})
export class ElementsComponent implements AfterViewInit,OnInit  {
  availableClasses: string[] = ["sidebar-hide", "sidebar-show"];
  currentClassIdx: number = 0;
  status: boolean = false;
  bodyClass: string;
  constructor(private navService: NavigationService, private commonSvc: CommonService,) {
    this.bodyClass = this.availableClasses[this.currentClassIdx];
    // this.changeBodyClass();
  }
  ngAfterViewInit(): void {

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Tooltip and popover demos
    document.querySelectorAll('.tooltip-demo')
    .forEach(function (tooltip) {
      new bootstrap.Tooltip(tooltip, {
        selector: '[data-bs-toggle="tooltip"]'
      })
    })

  document.querySelectorAll('[data-bs-toggle="popover"]')
    .forEach(function (popover) {
      new bootstrap.Popover(popover)
    })

  document.querySelectorAll('.toast')
    .forEach(function (toastNode) {
      var toast = new bootstrap.Toast(toastNode, {
        autohide: false
      })

      toast.show()
    })
  }
  ngOnInit(): void {
   // Tooltip //
   this.temp = [...this.rows];
    
  }
  clickEvent() {
    this.status = !this.status;
    const bodyElement = document.body;

    if (bodyElement) {


      this.currentClassIdx = this.getNextClassIdx();
      const nextClass = this.availableClasses[this.currentClassIdx];
      const activeClass = this.availableClasses[this.getPrevClassIdx()];

      // remove existing class (needed if theme is being changed)
      bodyElement.classList.remove(activeClass);
      // add next theme class
      bodyElement.classList.add(nextClass);

      this.bodyClass = nextClass;
    }
  }

  closeSideBar() {
    if (this.commonSvc.getScreenResolutionBreakPoint() === 'small' || this.commonSvc.getScreenResolutionBreakPoint() === 'min') {
      this.navService.toggleNavState();
    }
  }

  transform(value: string, size: number = 10): string {
    if (!value) {
      return '';
    }
    const limit = size > 0 ? size : 10;
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
  getPrevClassIdx(): number {
    return this.currentClassIdx === 0
      ? this.availableClasses.length - 1
      : this.currentClassIdx - 1;
  }

  getNextClassIdx(): number {
    return this.currentClassIdx === this.availableClasses.length - 1
      ? 0
      : this.currentClassIdx + 1;
  }

  /////*****************ANGULAR DATATABLE********************* */
  public rows = [
    {
      "id": 0,
      "name": "Ramsey Cummings",
      "gender": "male",
      "age": 52,
      "completion":'25%',
      "address": {
        "state": "South Carolina",
        "city": "Glendale"
      }
    },
    {
      "id": 1,
      "name": "Stefanie Huff",
      "gender": "female",
      "age": 70,
      "completion":'25%',
      "address": {
        "state": "Arizona",
        "city": "Beaverdale"
      }
    },
    {
      "id": 2,
      "name": "Mabel David",
      "gender": "female",
      "age": 52,
      "completion":'25%',
      "address": {
        "state": "New Mexico",
        "city": "Grazierville"
      }
    },
    {
      "id": 3,
      "name": "Frank Bradford",
      "gender": "male",
      "age": 61,
      "completion":'25%',
      "address": {
        "state": "Wisconsin",
        "city": "Saranap"
      }
    },
    {
      "id": 4,
      "name": "Forbes Levine",
      "gender": "male",
      "age": 34,
      "completion":'25%',
      "address": {
        "state": "Vermont",
        "city": "Norris"
      }
    },
    {
      "id": 5,
      "name": "Santiago Mcclain",
      "gender": "male",
      "age": 38,
      "completion":'25%',
      "address": {
        "state": "Montana",
        "city": "Bordelonville"
      }
    },
    {
      "id": 6,
      "name": "Merritt Booker",
      "gender": "male",
      "age": 33,
      "completion":'25%',
      "address": {
        "state": "New Jersey",
        "city": "Aguila"
      }
    },
    {
      "id": 7,
      "name": "Oconnor Wade",
      "gender": "male",
      "age": 18,
      "completion":'25%',
      "address": {
        "state": "Virginia",
        "city": "Kenmar"
      }
    },
    {
      "id": 8,
      "name": "Leigh Beasley",
      "gender": "female",
      "age": 53,
      "completion":'25%',
      "address": {
        "state": "Texas",
        "city": "Alfarata"
      }
    },
    {
      "id": 9,
      "name": "Johns Wood",
      "gender": "male",
      "age": 52,
      "completion":'25%',
      "address": {
        "state": "Maine",
        "city": "Witmer"
      }
    },
    {
      "id": 10,
      "name": "Thompson Hays",
      "gender": "male",
      "age": 38,
      "completion":'25%',
      "address": {
        "state": "Nevada",
        "city": "Kipp"
      }
    },
    {
      "id": 11,
      "name": "Hallie Mack",
      "gender": "female",
      "age": 19,
      "completion":'25%',
      "address": {
        "state": "Minnesota",
        "city": "Darrtown"
      }
    },
    {
      "id": 12,
      "name": "Houston Santos",
      "gender": "male",
      "age": 24,
      "completion":'25%',
      "address": {
        "state": "Georgia",
        "city": "Crucible"
      }
    },
    {
      "id": 13,
      "name": "Brandy Savage",
      "gender": "female",
      "age": 65,
      "completion":'25%',
      "address": {
        "state": "Idaho",
        "city": "Nord"
      }
    },
    {
      "id": 14,
      "name": "Finch Barnett",
      "gender": "male",
      "age": 22,
      "completion":'25%',
      "address": {
        "state": "Ohio",
        "city": "Osmond"
      }
    },
    {
      "id": 15,
      "name": "Nicole Crosby",
      "gender": "female",
      "age": 77,
      "completion":'25%',
      "address": {
        "state": "Kentucky",
        "city": "Fairfield"
      }
    },
    {
      "id": 16,
      "name": "Carrie Mcconnell",
      "gender": "female",
      "age": 26,
      "completion":'25%',
      "address": {
        "state": "South Dakota",
        "city": "Waikele"
      }
    },
    {
      "id": 17,
      "name": "Ann James",
      "gender": "female",
      "age": 37,
      "completion":'25%',
      "address": {
        "state": "North Dakota",
        "city": "Siglerville"
      }
    },
    {
      "id": 18,
      "name": "Becky Sanford",
      "gender": "female",
      "age": 48,
      "completion":'25%',
      "address": {
        "state": "Massachusetts",
        "city": "Celeryville"
      }
    },
    {
      "id": 19,
      "name": "Kathryn Rios",
      "gender": "female",
      "age": 39,
      "completion":'25%',
      "address": {
        "state": "Delaware",
        "city": "Kylertown"
      }
    },
    {
      "id": 20,
      "name": "Dotson Vaughn",
      "gender": "male",
      "age": 68,
      "completion":'25%',
      "address": {
        "state": "Arkansas",
        "city": "Monument"
      }
    },
    {
      "id": 21,
      "name": "Wright Kline",
      "gender": "male",
      "age": 41,
      "completion":'25%',
      "address": {
        "state": "Missouri",
        "city": "Bynum"
      }
    },
    {
      "id": 22,
      "name": "Lula Morgan",
      "gender": "female",
      "age": 52,
      "completion":'25%',
      "address": {
        "state": "Oregon",
        "city": "Mapletown"
      }
    },
    {
      "id": 23,
      "name": "Kay Mendez",
      "gender": "female",
      "age": 50,
      "completion":'25%',
      "address": {
        "state": "Michigan",
        "city": "Twilight"
      }
    },
    {
      "id": 24,
      "name": "Mona Maddox",
      "gender": "female",
      "age": 35,
      "completion":'25%',
      "address": {
        "state": "Wyoming",
        "city": "Wilmington"
      }
    },
    {
      "id": 25,
      "name": "Fulton Velez",
      "gender": "male",
      "age": 66,
      "completion":'25%',
      "address": {
        "state": "Colorado",
        "city": "Loretto"
      }
    },
    {
      "id": 26,
      "name": "Ericka Craft",
      "gender": "female",
      "age": 80,
      "completion":'25%',
      "address": {
        "state": "Nebraska",
        "city": "Beaulieu"
      }
    },
    {
      "id": 27,
      "name": "Richmond Rodriguez",
      "gender": "male",
      "age": 62,
      "completion":'25%',
      "address": {
        "state": "Rhode Island",
        "city": "Vallonia"
      }
    },
    {
      "id": 28,
      "name": "Olsen Farmer",
      "gender": "male",
      "age": 45,
      "completion":'25%',
      "address": {
        "state": "Connecticut",
        "city": "Romeville"
      }
    },
    {
      "id": 29,
      "name": "Sophie Austin",
      "gender": "female",
      "age": 59,
      "completion":'25%',
      "address": {
        "state": "New Hampshire",
        "city": "Gorst"
      }
    },
    {
      "id": 30,
      "name": "Alta Olsen",
      "gender": "female",
      "age": 58,
      "completion":'25%',
      "address": {
        "state": "Florida",
        "city": "Drytown"
      }
    },
  ]as any;
  public columns = [{ prop: 'name', }, {  name: 'Gender' }, { name: 'Age' },{ name: 'Completion' },];
  loadingIndicator = true;
  reorderable = true;
  selected = []as any;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  editing = {}as any;
  temp = []as any;
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  onSelect({ selected }:any) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
  
  displayCheck(row:any) {
    return row.name !== 'Ethel Price';
  }
  onActivate(event:any) {
    console.log('Activate Event', event);
  }
  updateValue(event:any, cell:any, rowIndex:any) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
    console.log('UPDATED!', this.rows[rowIndex][cell]);
  }
  updateFilter(event:any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d:any) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
  setPage(pageInfo: { offset: number; }) {
    // this.paginationObj.currentPage = pageInfo.offset;
    // this.serverResultsService.getResults(this.page).subscribe(pagedData => {
    //   this.page = pagedData.page;
    //   this.rows = pagedData.data;
    // });
  }
  toggleExpandRow(row:any) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event:any) {
    console.log('Detail Toggled', event);
  }
  action(obj:any){
    console.log(obj);
    
  }
}


