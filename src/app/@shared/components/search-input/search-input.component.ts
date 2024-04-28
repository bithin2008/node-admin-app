import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnInit {
  @Output() inputValue = new EventEmitter<string>();
  @Input() resetInput!: boolean;
  @Input() placeHolderText = '';
  @Input() defaultValue = '';
  searchValue = '';
  submitted= false;
  constructor() {
    if (this.resetInput) {
      this.resetInputValue();
    }
  }

  ngOnInit(): void {
    if(this.defaultValue){
      this.searchValue=this.defaultValue;
    }
    
    document.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLInputElement)) return; // Use HTMLInputElement type
      if (!target.matches('.resize-input')) return;
      (target.previousElementSibling as HTMLElement).textContent = target.value;
    });
    
    
    Array.from(document.querySelectorAll('.resize-input')).forEach((input:any) => {
      (input.previousElementSibling as HTMLElement).textContent = input.value;
    });
  }

  resetInputValue() {
    this.searchValue = '';
    this.inputValue.emit('');
  }
  onInputTextBox(event: any) {
    let inputValue: string = event.target.value;
    if (inputValue.length==0) {
      this.inputValue.emit('');
    }
  }
  onSubmit(f: NgForm) {
    this.submitted = true;
    console.log(f.value.searchText);
    
    this.inputValue.emit(f.value.searchText);
  };


  
}
