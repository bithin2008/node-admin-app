import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { CommonService } from 'src/app/@core/services/common.service';
import { FormValidationService } from 'src/app/@core/services/form-validation.service';
// import { DataType } from './DataType';


@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent {
  @Input() advancedSearchConfig: any
  @Output() inputValueChange = new EventEmitter<any>();

  searchForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private formValidationSvc: FormValidationService,
    private commonSvc: CommonService,
    private cdRef: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    //console.log('advance search',this.advancedSearchConfig);
    
  }
  ngAfterViewInit() {
    // if deafualt value is exist then search functionality exicute by default
    setTimeout(() => {
      for (let i = 0; i <this.advancedSearchConfig.inputConfig.length; i++) {
        const element =this.advancedSearchConfig.inputConfig[i];
        if (element.value!=null) {
          this.onInputChange(element.value)
         
        }

      }
       this.search();
      
    }, 500);
 
    this.cdRef.detectChanges()

    this.formValidationSvc.forms();
  }
  searchQuery: string = ''
  onInputChange(value: any, config: any=null) {
    // Reconstruct the search query based on the updated input values
    this.searchQuery = '';
    this.advancedSearchConfig.inputConfig
      .filter((element: any) => element.value)
      .forEach((element: any) => {
        if (element.type === 'dateRangePicker') {
          if (element.value.length > 0) {
            if (element.propertyName === 'created_at') {
              this.searchQuery += `&created_from=${moment(element.value[0]).format('YYYY-MM-DD')}&created_to=${moment(element.value[1]).format('YYYY-MM-DD')}`;
            }else{
            this.searchQuery +=   `&${element.propertyName}=${[moment(element.value[0]).format('YYYY-MM-DD'),moment(element.value[1]).format('YYYY-MM-DD')]}`
            }
          }

        } else if (element.inputType == 'mobile') {
          this.searchQuery += `&${element.propertyName}=${this.commonSvc.convertToNormalPhoneNumber(value)}`;
        }else if (element.type === 'autoCompleteTextBox') {
          this.searchQuery += `&${element.propertyName}=${element.value}`;
        } else {

          this.searchQuery += `&${element.propertyName}=${element.value}`;
        }
      });

    // console.log(this.searchQuery);
    if (!value) {
      this.search()
    }
  }

  keyword = 'name';
  data = [
    {
      id: 1,
      name: 'Georgia'
    },
    {
      id: 2,
      name: 'Usa'
    },
    {
      id: 3,
      name: 'England'
    }
  ];

  onInputTextBox(event: any, config: any) {
    let inputValue: string = event.target.value;
    if (config.inputType == 'number' || config.inputType === 'mobile') {
      // Replace non-numeric characters with an empty string
      inputValue = inputValue.replace(/[^0-9]/g, '');
      // Update the input value
      event.target.value = inputValue;
    }
    if (config.inputType === 'mobile') {
      if (event.target.value.length==10) {
        config.value = this.commonSvc.setUSFormatPhoneNumber(event.target.value)
      }
    }
  }
  selectEvent(item: any) {
    // do something with selected item
  }

  onChangeAutoCompleteSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
    console.log('val',val);
    if (val) {
      //this.searchQuery
      this.inputValueChange.emit({ searchQuery: this.searchQuery, advancedSearchConfig: this.advancedSearchConfig });

    }
  }

  onFocused(e: any) {
    // do something when input is focused
  }


  resetAllSearchFilter() {
    this.advancedSearchConfig.inputConfig.forEach((element:any) => {
      element.value=null
    });
    this.searchQuery=''
    this.search()
    setTimeout(() => {
       this.cdRef.detectChanges()
    this.formValidationSvc.forms();
    }, 300);
   
  }

  changeDateRange(ev: any, config: any) {
    if (ev) {
      //  console.log(config);
    this.formValidationSvc.forms()
    }
  }
  search() {
    this.inputValueChange.emit({ searchQuery: this.searchQuery, advancedSearchConfig: this.advancedSearchConfig });
  }
}
