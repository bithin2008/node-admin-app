import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCardExpiryDate]'
})
export class CardExpiryDateDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input') onInput() {
    const input = this.el.nativeElement;

    let sanitizedValue = input.value.replace(/[^0-9]/g, '');
    if (sanitizedValue.length >= 2) {
      sanitizedValue = `${sanitizedValue.slice(0, 2)}/${sanitizedValue.slice(2)}`;
    }
   
    if (sanitizedValue.length >= 5) {
      // Trim the input if it exceeds the maximum length
      const trimmedValue = sanitizedValue.slice(0, 5);
      this.el.nativeElement.value = trimmedValue;
    } else {
      // Update the input with the sanitized value
      sanitizedValue = `${sanitizedValue.slice(0, 2)}${sanitizedValue.slice(3)}`;
      this.el.nativeElement.value = sanitizedValue;
    }
  }
}
