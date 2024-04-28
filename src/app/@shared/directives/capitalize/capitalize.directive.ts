import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCapitalize]'
})
export class CapitalizeDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  @HostListener('input') onInput() {
      const input = this.el.nativeElement;
    let words = input.value.toLowerCase().split(' ');

    // Capitalize the first word by default
    if (words.length > 0) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }

    // Capitalize the first letter after a space
    for (let i = 1; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }

    input.value = words.join(' ');
    this.renderer.setProperty(input, 'value', input.value);
  }
  
}
