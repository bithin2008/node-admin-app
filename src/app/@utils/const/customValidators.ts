import { FormGroup } from '@angular/forms';
    
export function CustomValidators(controlName: string, matchingControlName: string){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors['customValidators']) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ customValidators: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}