import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export function intensityRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value < 1 || value > 10) {
      return { 'intensityRange': { value } };
    }
    return null; 
  };
}
