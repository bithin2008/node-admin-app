import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneUsFormat'
})
export class PhoneUsFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (!value) {
      return '';
    }

    // Remove all non-digit characters from the input
    const cleaned = ('' + value).replace(/\D/g, '');

    // Format the phone number
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    // Return the original value if the input is not a valid US phone number
    return value;
  }

}
