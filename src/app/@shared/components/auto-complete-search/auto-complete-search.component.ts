import { ChangeDetectorRef, Component, EventEmitter, Input, Output, } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-auto-complete-search',
  templateUrl: './auto-complete-search.component.html',
  styleUrls: ['./auto-complete-search.component.scss']
})
export class AutoCompleteSearchComponent {
  /* @Input()  autoCompleteConfig={
    // searchKeyword:'name',
    // placeholder : 'Search',
    // data : [
    //   {
    //     id: 1,
    //     name: 'Albania',
    //   },
    //   {
    //     id: 2,
    //     name: 'Belgium',
    //   },
    //   {
    //     id: 3,
    //     name: 'Denmark',
    //   },
    //   {
    //     id: 4,
    //     name: 'Montenegro',
    //   },
    //   {
    //     id: 5,
    //     name: 'Turkey',
    //   },
    //   {
    //     id: 6,
    //     name: 'Ukraine',
    //   },
    //   {
    //     id: 7,
    //     name: 'Macedonia',
    //   },
    //   {
    //     id: 8,
    //     name: 'Slovenia',
    //   },
    //   {
    //     id: 9,
    //     name: 'Georgia',
    //   },
    //   {
    //     id: 10,
    //     name: 'India',
    //   },
    //   {
    //     id: 11,
    //     name: 'Russia',
    //   },
    //   {
    //     id: 12,
    //     name: 'Switzerland',
    //   }
    // ]
  }as any */
 
  @Input() autoCompleteConfig = {
    searchKeyword: '',
    defaultSearchValue:'',
    placeholder: 'Search',
    minQueryLength:1,
    debounceTime:0,
    template:``,
    data: [],
    dataFetched: false

  } as any
  private selectedItemSubject = new Subject<any>();
  public isDataNotLoaded:boolean=false;
  @Output() selectedItem = new EventEmitter<any>();
  @Output() searchingValue = new EventEmitter<any>();
  constructor(private cd: ChangeDetectorRef) {
    this.selectedItemSubject.pipe(debounceTime(800)).subscribe((item) => {
      // Emit the debounced event
      this.autoCompleteConfig.defaultSearchValue=item
      this.selectedItem.emit(item);
      setTimeout(() => {
        this.cd.detectChanges()
      }, 800);
    });

  }
  ngOnInit(): void {
    console.log(this.autoCompleteConfig);
  }
  ngDoCheck() {
   /*  if (this.autoCompleteConfig.searchKeyword !== this.autoCompleteConfig.searchKeyword) {
      // console.log('Value changed from',this.autoCompleteConfig);
      if (this.autoCompleteConfig.data && this.autoCompleteConfig.data.length > 0) {
        this.data = this.autoCompleteConfig.data
        this.cd.detectChanges()

      }
    } */
  }
  selectEvent(item: any) {
    // do something with selected item
     console.log('selectEvent',item);
    this.selectedItem.emit(item);

  }

  onChangeSearch(search: string) {
    this.isDataNotLoaded=false;   
    // console.log(search);
     this.searchingValue.emit(search);
    //this.selectedItemSubject.next(search)

      setTimeout(() => {
        if(this.autoCompleteConfig.dataFetched && this.autoCompleteConfig.data.length==0){
          this.isDataNotLoaded=true;        
        }  
      }, 600);   
    console.log('searchValue',this.autoCompleteConfig.defaultSearchValue);
  }
  inputCleared() {
    this.autoCompleteConfig.data.length==0;
    this.searchingValue.emit('');
  }
  onFocused(e: any) {
    // do something
    //console.log(e);

  }
}


