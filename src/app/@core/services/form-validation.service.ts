import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UntypedFormGroup, UntypedFormControl, AbstractControl, ValidatorFn, ValidationErrors, FormArray, AsyncValidatorFn, FormControl } from '@angular/forms';
import { regEx } from '../../@utils/const/regEx';
import { AppConfig } from 'src/app/@utils/const/app.config';
import { ApiService } from 'src/app/@core/services/api.service';
import { Observable, map, catchError, of } from 'rxjs';
import { CommonService } from './common.service';
import * as $ from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor(
    private apiSvc: ApiService,
    private commonSvc: CommonService
  ) { }

  validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getValidatorErrorMessage(rule: string, validatorValue?: any) {
    const errorMessage: any = {
      required: 'The field is required.',
      minlength: `The field must be at least ${validatorValue?.requiredLength} characters long.`,
      maxlength: `The field cannot be more than ${validatorValue?.requiredLength} characters long.`,
      min: `Min value must be at least ${validatorValue?.min}.`,
      max: `Value should not exceed more than ${validatorValue?.max}.`,
      email: 'Please enter a valid email address.',
      validEmail: 'Please enter a valid email address i.e name@example.com',
      phoneNumber: 'Please enter a 10 digit phone number.',
      minValueCheck:'Invalid minimum value',
      ruleOne: 'error message 1',
      ruleTwo: 'error message 2',
      ruleThreec: 'error message 3',
      invalidExpiryDateFormat:'Invalid expiry date',
      invalidCVV:'Invalid cvv',
      invalidPassword: 'Password must be 8 chars long including at least one lowercase letter, one special character, one uppercase letter, one number.',
      uniqueVal: `unique value `,
      invalidDomain: 'Please enter email with @unitedexploration.co.in only.',
      notMatching: 'Confirm field value should match with Actual value.',
      passwordNotMatching: 'Confirm Password should match with Password.',
      accountNoNotMatching: 'Confirm account no should match with Account no.',
      userNameExists: 'This username is already registered.',
      invalidPAN: 'Please enter a valid PAN number.',
      minLengthArray: 'Please select at least one date from the calendar.',
      invalidAlphaNumericWithSpace: 'Please enter alpha numeric values with space & few allowed special characters.',
      invalidNumericTwoDecimal: 'Numeric upto two decimal is accepted.',
      invalidNumber: 'This field should be only integer number.',
      invalidName: 'Please enter name using valid characters.',
      notEmpty: 'The field can not be empty.',
      noSpecialCharacters: `The field should not contain special characters`,
      invalidFblink: `Please enter valid facebook link`,
      invalidInstalink: `Please enter valid instagram link`,
      invalidTwitterlink: `Please enter valid twitter link`,
      invalidYoutubelink: `Please enter valid youtube link`,
      invalidLinkedinlink: `Please enter valid linkedin link`,
      invalidWhatsapplink: `Please enter valid whatsapp link`,
      invalidPinterestlink: `Please enter valid pinterest link`,
      invalidZipCode: `Invalid zipcode`

    };
    if (errorMessage[rule]) {
      return errorMessage[rule];
    } else {
      return 'Rule: ' + rule + ' : This field has a generic error.';
    }
  }

  validEmail(control: AbstractControl) {
    const valid = control?.value ? control?.value?.match(regEx.email) : true;
    return valid ? null : { 'validEmail': true };
  }

  phoneNumber(control: AbstractControl) {
    const valid = control?.value ? control?.value?.match(regEx.phone_number) : true;
    return valid ? null : { 'phoneNumber': true };
  }

  phoneNumberUS(control: AbstractControl) {
    const valid = control?.value ? control?.value?.match(regEx.phone_number_US) : true;
    return valid ? null : { 'phoneNumber': true };
  }

  test1(control: AbstractControl) {
    return (control?.value == 'one') ? { 'ruleOne': true } : null;
  }

  test2(control: AbstractControl) {
    return (control?.value == 'two') ? { 'ruleTwo': true } : null;
  }

  test3(control: AbstractControl) {
    return (control?.value == 'three') ? { 'ruleThree': true } : null;
  }

  strongPassword(control: AbstractControl) {
    // password should have minimum 8 chars long with 1 lower case, 1 upper case & 1 number
    const regex = new RegExp(regEx.strong_password);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidPassword': true };
  }

  validName(control: AbstractControl) {
    const regex = new RegExp(regEx.name);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidName': true };
  }

  uniqueValue(inputObj: any) {
    return new Promise((resolve) => {
      let payLoad = {
        value: inputObj?.control,//control?.value,
        field: inputObj?.field,
        model: inputObj.model
      };
      this.apiSvc.post(AppConfig.apiUrl.common.uniqueValcheck, payLoad).subscribe({
        next: (res: any) => {
          resolve(res);
        }
      })
    });
  }


  // uniqueValue(valid:boolean) {
  //   console.log(valid);

  //   return valid ?{ 'uniqueVal': true }: null ;
  // }


  validEmailDomain(control: AbstractControl) {
    let error = null;
    if (control?.value && control?.value.indexOf("@") != -1) {
      let [_, domain] = control?.value.split("@");
      if (domain == "unitedexploration.co.in") {
        error = null;
      } else {
        error = { 'invalidDomain': true };
      }
    }
    return error;
  }

  matchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
        if (c) {
          c.updateValueAndValidity();
        }
        return null;
      }
      if (matchTo === 'password' || matchTo === 'confirmPassword') {
        return !!control.parent && !!control.parent.value && control.value === (control.parent?.controls as any)[matchTo].value ? null : { passwordNotMatching: true };
      }
      if (matchTo === 'accountNo' || matchTo === 'confirmAccountNo') {
        return !!control.parent && !!control.parent.value && control.value === (control.parent?.controls as any)[matchTo].value ? null : { accountNoNotMatching: true };
      }
      return !!control.parent && !!control.parent.value && control.value === (control.parent?.controls as any)[matchTo].value ? null : { notMatching: true };
    };
  }

  validPAN(control: AbstractControl) {
    const valid = control?.value ? control?.value?.match(regEx.pan_number) : true;
    return valid ? null : { 'invalidPAN': true };
  }

  minLengthArray(control: AbstractControl) {
    return control.value?.length > 0 ? null : { 'minLengthArray': true };
  }

  alphaNumericWithSpace(control: AbstractControl) {
    const regex = new RegExp(regEx.alphanumericWithSpaceAllowedChars);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidAlphaNumericWithSpace': true };
  }

  numericTwoDecimal(control: AbstractControl) {
    const regex = new RegExp(regEx.numeric_two_decimal_places);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidNumericTwoDecimal': true };
  }

  numericOnly(control: AbstractControl) {
    if (control.value) {

      const regex = new RegExp(regEx.numeric_only);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidNumber': true };
    }
    return null;
  }

 

  notEmpty(control: AbstractControl) {
    const valid = control?.value ? !control?.value?.match(regEx.onlyspace) : true;
    return valid ? null : { 'notEmpty': true };
  }
  noSpecialCharacters() {
    return (control: AbstractControl) => {
      const pattern = /^[a-zA-Z0-9 ]*$/; // Regular expression to allow only letters, numbers, and spaces.
      const value = control.value;
      if (value && !value.match(pattern)) {
        return { 'noSpecialCharacters': true };
      }
      return null;
    };
  };

  validFbLink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.fbPattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidFblink': true };
    }
    return null;
  }
  validInstaLink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.instaPattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidInstalink': true };
    }
    return null;
  }
  validYoutubeLink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.youtubePattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidYoutubelink': true };
    }
    return null;
  }
  validTwitterLink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.twitterPattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidTwitterlink': true };
    }
    return null;
  }
  validLinkedinLink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.linkedinPattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidLinkedinlink': true };
    }
    return null;
  }
  validWhatsappink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.whatsappPattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidWhatsapplink': true };
    }
    return null;
  }

  validPinterestLink(control: AbstractControl) {
    if (control.value) {
      const regex = new RegExp(regEx.pinterestPattern);
      const valid = regex.test(control.value);
      return valid ? null : { 'invalidPinterestlink': true };
    }
    return null;
  };
  async validateZipCode(control: AbstractControl) {
    if (control.value) {
      const zipCode = control.value;
      console.log('zipCode0', zipCode);
      let response: any = await this.commonSvc.validateZipCode(zipCode);
      if (response.status === 1) {
        control.setErrors(null); // Zip code is valid, clear errors
      } else {
        control.setErrors({ 'invalidZipCode': true }); // Zip code is invalid, set error
      }
    }
    return null;
  }
  validateCard(control: AbstractControl) {
    const regex = new RegExp(regEx.card_number_format);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidCardNumber': true };
  }
  validateExpirationDateFormat(control: AbstractControl) {
    const regex = new RegExp(regEx.card_expiry_date_format);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidExpiryDateFormat': true };
  }

  expiryDateValidator(control: AbstractControl) {
    if (!control.value) {
      return null
    }
    let validDate = true;
    const currentDate = new Date();
    const enteredDateParts = control.value.split('/');
    
    if (enteredDateParts.length === 2) {
        const enteredMonth = parseInt(enteredDateParts[0]);
        const enteredYear = parseInt(enteredDateParts[1]);
        
        // Adjust the entered year to a full year representation
        const fullEnteredYear = enteredYear < 100 ? 2000 + enteredYear : enteredYear;
        
        // Create a new date with the last day of the entered month and year
        const enteredDate = new Date(fullEnteredYear, enteredMonth, 0);
        
        // Check if entered date is in the current year or a future year
        if (enteredDate < currentDate) {
            validDate = false;
        }
    } else {
        validDate = false; // Invalid format
    }
    
    return validDate ? null : { 'invalidExpiryDateFormat': true };
}

  validateCVV(control: AbstractControl) {
    const regex = new RegExp(regEx.cvv);
    const valid = regex.test(control.value);
    return valid ? null : { 'invalidCVV': true };
  }

  /* validateZipCode(): AsyncValidatorFn {    
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const zipCode = control.value;
      console.log('called',zipCode);

      // If zip code is empty or null, consider it valid
      if (!zipCode) {
        return of(null);
      }

      // Call the API service to validate the zip code
      return  this.apiSvc.post(AppConfig.apiUrl.locationByZip, { zip: zipCode.toString() }).pipe(
        map((response:any) => {
          console.log('formvalsvc', response);
          // If the API response is true, zip code is valid
          if (response.status==1) {
            return null; // No error, valid zip code
          } else {
            // Zip code is invalid, return an error
            return { 'invalidZipCode': true };
          }
        }),
        catchError(() => of(null)) // Handle API errors gracefully
      );
    };
  } */
  forms() {
    $('.form--contact .textBox input').focus(function () {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    $('.form--contact .textBox input').focusout(function () {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    let allFormField: any = document.querySelectorAll(".form-control");

    $('.form-control').on('input', () => {
      $(this).parent().toggleClass('not-empty');
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });

    $(document).ready(function () {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      $('.form-control').on('input', function () {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      });
    });

    $(function () {
      $('.form-control').focusout(function () {
        var text_val = $(this).val();
        $(this).parent().toggleClass('not-empty', text_val !== "");
      }).focusout();
    });

    setTimeout(function () {
      for (let i = 0; i < allFormField.length; i++) {
        if (allFormField[i].value) {
          allFormField[i].parentNode.classList.add("has-value");

          if (allFormField[i].tagName == "TEXTAREA") {
            allFormField[i].style.cssText = "height: var(--initHeight);";
            allFormField[i].style.cssText = `height: ${allFormField[i].scrollHeight}px`;
          }
        }


        let currentElem = allFormField[i];
        //     console.log('allFormField[i].getAttribute',currentElem.getAttribute('disabled'));
        if (allFormField[i].getAttribute('disabled') != null) {
          allFormField[i].nextElementSibling.style.setProperty('background-color', `transparent`);
        }

      }
    }, 100);

    for (let i = 0; i < allFormField.length; i++) {
      if (allFormField[i].tagName == "TEXTAREA") {
        allFormField[i].addEventListener("input", function () {
          allFormField[i].style.cssText = "height: var(--initHeight);";
          allFormField[i].style.cssText = `height: ${allFormField[i].scrollHeight}px`;
        });
      }
      allFormField[i].addEventListener("focus", function () {
        allFormField[i].parentNode.classList.add("has-value");
      });
      allFormField[i].addEventListener("blur", function () {
        if (!allFormField[i].value) {
          allFormField[i].parentNode.classList.remove("has-value");
        }
      });
    }

    (function (document, window, index) {
      var inputs = document.querySelectorAll('.inputfile');
      Array.prototype.forEach.call(inputs, function (input) {
        var label = input.nextElementSibling,
          labelVal = label.innerHTML;

        input.addEventListener('change', (e: any) => {
          var fileName = '';
          if (input.files && input.files.length > 1)
            fileName = (input.getAttribute('data-multiple-caption') || '').replace('{count}', input.files.length);
          else
            fileName = e.target.value.split('\\').pop();

          if (fileName)
            label.querySelector('span').innerHTML = fileName;
          else
            label.innerHTML = labelVal;
        });

        // Firefox bug fix
        input.addEventListener('focus', function () { input.classList.add('has-focus'); });
        input.addEventListener('blur', function () { input.classList.remove('has-focus'); });
      });
    }(document, window, 0));
   
    // jQuery('.form-elementfile input[type="file"]').on('change', function() {
    //     var infile = $(this).val();
    //     var filename = infile.split("\\");
    //     filename = filename[filename.length - 1];
    //     jQuery(this).parents('.form-elementfile').find('#filename').text(filename);
    //     // $(this).parent().addClass('hasValueall');
    // });

    // TEXTAREA.addEventListener('input', function(){
    // 	this.style.cssText = 'height: var(--initHeight);'
    // 	this.style.cssText = `height: ${this.scrollHeight}px`;
    // });

    // IF TABINDEX ON
    document.getElementsByTagName('div')[0].focus(); 

  }
}
