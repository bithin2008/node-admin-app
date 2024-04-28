import { Component, OnInit, Input, } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { FormValidationService } from '../../../@core/services/form-validation.service';
@Component({
  selector: 'app-duplicate-value-check',
  templateUrl: './duplicate-value-check.component.html',
})
export class DuplicateValueCheckComponent implements OnInit {
  @Input()
  control!: AbstractControl;

  @Input()
  data!: any;

  @Input()
  field!: any;

  @Input()
  field_text!: any;
  constructor(private formValidationSvc: FormValidationService,) { }

  ngOnInit() {
  }

  get errorMessage() {
    const fG = this.control.parent;
    for (let index = 0; index < this.data.length; index++) {
      if (this.data[index].field == this.field) {
        return this.data[index];
      }      
    }
    return null;   
  }

}
