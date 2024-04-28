import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appPositiveNumber]'
})
export class PositiveNumberDirective {
  @Input() decimal: boolean = false; // Allow decimal values if true
  @Input() maxAllowed!:number;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Remove any non-numeric and non-decimal characters based on the 'decimal' input
    if (this.decimal) {
      // Allow only numbers and a maximum of 2 decimal places
      inputValue = inputValue.replace(/[^0-9.]/g, '');
      const decimalParts = inputValue.split('.');
      if (decimalParts.length > 1) {
        // Limit decimal part to 2 digits
        decimalParts[1] = decimalParts[1]?.slice(0, 2);
        inputValue = decimalParts.join('.');
      }
    } else {
      inputValue = inputValue.replace(/[^0-9]/g, '');
    }

    // Ensure that the value is between 0 and 99
    if (inputValue !== '') {
      const numericValue = parseFloat(inputValue);
      if (this.maxAllowed) {
        inputValue = numericValue < 0 ? '0' : numericValue > this.maxAllowed ? this.maxAllowed.toString() : inputValue;

      }
    }

    // Update the input value
    inputElement.value = inputValue;
  }
}
