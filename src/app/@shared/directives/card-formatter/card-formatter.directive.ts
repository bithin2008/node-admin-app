import { Directive, ElementRef, HostListener } from '@angular/core';
import { CommonService } from 'src/app/@core/services/common.service';

@Directive({
  selector: '[appCardFormatter]'
})
export class CardFormatterDirective {

  constructor(private el: ElementRef,private commonService:CommonService) {
   }

  /* @HostListener('input', ['$event'])
  onInput(event: any): void {
    
    const input = event.target;
    const value = input.value;
    console.log('input',input);

    // Remove non-digit characters
    const digitsOnly = value.replace(/\D/g, '');

    // Limit the input to 16 digits
    const formattedValue = digitsOnly.slice(0, 16);

    // Add spaces every 4 characters
    const spacedValue = formattedValue.match(/.{1,4}/g)?.join(' ');

    input.value = spacedValue || '';

    // If you want to emit the formatted value to a ngModel or ngControl, you can do so here
    // For example, if you're using ngModel:
    // this.ngModel.valueAccessor.writeValue(spacedValue);
  } */
  // @HostListener('input') onInput() {
  //   const input = this.el.nativeElement;
  //   const value = input.value.replace(/\D/g, ''); // Remove non-digit characters
  //   const formattedValue = value.substring(0, 17); // Truncate to 16 characters
  //   const spacedValue = formattedValue.match(/.{1,4}/g)?.join(' ') || ''; // Add spaces every 4 characters
  //   if (spacedValue.length>3) {
  //     const cardType = this.commonService.getCardType(formattedValue);
  //     console.log(cardType);
  //   }
  //   input.value = spacedValue;
  // }

  @HostListener('input') onInput() {
    const input = this.el.nativeElement;
    const value = input.value.replace(/\D/g, ''); // Remove non-digit characters
    const formattedValue = value.substring(0, 16); // Truncate to 16 characters
    const spacedValue = formattedValue.match(/.{1,4}/g)?.join(' ') || ''; // Add spaces every 4 characters
    const cardImage = document.getElementById('cardImage') as HTMLImageElement;
    if (spacedValue.length > 3) {
      const cardType = this.commonService.getCardType(formattedValue);
    
      // Set image source based on card type
      if (cardImage) {
        switch (cardType) {
          case 'Visa':
            cardImage.src = 'assets/img/allCardIcon/visa.svg';
            break;
          case 'Mastercard':
            cardImage.src = 'assets/img/allCardIcon/mastercard.svg';
            break;
          case 'Amex':
            cardImage.src = 'assets/img/allCardIcon/amex.svg';
            break;
          case 'Discover':
            cardImage.src = 'assets/img/allCardIcon/discover.svg';
            break;
          case 'Diners Club':
            cardImage.src = 'assets/img/allCardIcon/diners.svg';
            break;
          case 'JCB':
            cardImage.src = 'assets/img/allCardIcon/jcb.svg';
            break;
          // Add cases for other card types as needed
          default:
            cardImage.src = 'assets/img/allCardIcon/credit-card.svg'; // Set a default image for unknown card types
        }
      }
    }else{
      cardImage.src = 'assets/img/allCardIcon/credit-card.svg';
    }
    input.value = spacedValue;
  }
}



// function getCardType(cardNumber:any) {
//   var cardType = (/^5[1-5]/.test(cardNumber)) ? "Mastercard" : (/^4/.test(cardNumber)) ? "Visa" : (/^3[47]/.test(cardNumber)) ? 'Amex' : (/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(cardNumber)) ? 'Discover' : 'Unknown'
//   return cardType;
// }

