import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function intensityRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value < min || value > max) {
      return { 'intensityRange': { value, min, max } };
    }
    return null; 
  };
}
