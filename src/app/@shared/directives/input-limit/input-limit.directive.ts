import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appInputLimit]'
})
export class InputLimitDirective {
  @Input() appInputLimit!: number; // Dynamically set the maximum length
  @Input() appInputType: 'number' | 'text' | 'alphanumeric' = 'alphanumeric';

  constructor(private el: ElementRef) {
    
    
  }

  @HostListener('input', ['$event']) onInput(event: InputEvent): void {
    const value = (event.target as HTMLInputElement).value;
    const sanitizedValue = this.sanitizeInput(value);

    if (sanitizedValue.length > this.appInputLimit) {
      // Trim the input if it exceeds the maximum length
      const trimmedValue = sanitizedValue.slice(0, this.appInputLimit);
      this.el.nativeElement.value = trimmedValue;
    } else {
      // Update the input with the sanitized value
      this.el.nativeElement.value = sanitizedValue;
    }
  }

  // Sanitize the input based on the selected input type
  private sanitizeInput(value: string): string {
    if (this.appInputType === 'number') {
      return value.replace(/[^0-9]/g, ''); // Allow only numbers
    } else if (this.appInputType === 'text') {
      return value.replace(/[^a-zA-Z]/g, ''); // Allow only characters
    } else {
      return value.replace(/[^a-zA-Z0-9]/g, ''); // Allow alphanumeric characters
    }
  }
}