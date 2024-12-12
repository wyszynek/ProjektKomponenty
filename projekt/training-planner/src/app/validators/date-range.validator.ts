import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validator function
export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return { dateRangeInvalid: true }; // Błąd walidacji
  }

  return null; // Brak błędu
};