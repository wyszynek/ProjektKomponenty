import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarEventService } from '../services/calendar-event.service';
import { TrainingPlanService } from '../services/training-plan.service';

@Component({
  standalone: true,
  selector: 'app-edit-workout',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
  imports: [CommonModule, FormsModule],
})
export class EditWorkoutComponent implements OnInit {
  @Input() workout: any; // Otrzymuje dane treningu
  @Input() plan: any;
  @Output() cancel = new EventEmitter<void>(); // Emituje anulowanie edycji
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  availablePlans: any[] = [];
  originalTrainingPlanId: number | undefined;
  editableWorkout: any = {};
  editablePlan: any = {};

  selectedStartDate: any;
  selectedEndDate: any;

  constructor(private eventService: CalendarEventService, private trainingPlanService: TrainingPlanService) {}

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadTrainingPlans();
    if (this.workout) {
      this.originalTrainingPlanId = this.workout.trainingPlanId;
      this.editableWorkout = { ...this.workout };
    } else if (this.plan) {
      this.editablePlan = { 
        ...this.plan,
        startDate: this.formatDate(this.plan.startDate),
        endDate: this.formatDate(this.plan.endDate)
      };
    }
  }

  loadTrainingPlans(): void {
    this.trainingPlanService.getTrainingPlans().subscribe({
      next: (plans) => {
        this.availablePlans = plans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          startDate: plan.startDate,
          endDate: plan.endDate
        }));
      },
      error: (err) => {
        console.error('Error loading training plans:', err);
      },
    });
  }


  //Kiedy użytkownik zmienia tekst w jakimś polu, zdarzenie input jest wywoływane.
  //event.target odnosi się do elementu <input>, który został zmodyfikowany.
  //Za pomocą inputElement.value, otrzymujemy wartość wpisaną przez użytkownika.
  //Bez tych metod, zmiany w formularzu nie byłyby automatycznie przekazywane do modelu.

  onTrainingTypeInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editableWorkout.trainingType = inputElement.value.trim();
  }

  onDateInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editableWorkout.date = inputElement.value;
  }

  onIntensityInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = parseInt(inputElement.value, 10);
    this.editableWorkout.intensity = isNaN(value) ? null : value;
  }

  onDurationInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = parseFloat(inputElement.value);
    this.editableWorkout.duration = isNaN(value) ? 0 : value;
  }

  onDescriptionInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editableWorkout.description = inputElement.value.trim();
  }

  saveWorkout(): void {
    if (this.editableWorkout.date == null) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (this.editableWorkout.trainingType == "") {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (this.editableWorkout.intensity == null || this.editableWorkout.intensity > 10 || this.editableWorkout.intensity < 1) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (this.editableWorkout.duration < 1 || this.editableWorkout.duration == null) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    this.trainingPlanService.getPlan(this.editableWorkout.trainingPlanId).subscribe({
      next: (plan) => {
        this.selectedStartDate = new Date(plan.startDate);
        this.selectedEndDate = new Date(plan.endDate); 

        const workoutDate = new Date(this.editableWorkout.date);

        this.selectedStartDate.setHours(0, 0, 0, 0);
        this.selectedEndDate.setHours(0, 0, 0, 0);
        workoutDate.setHours(0, 0, 0, 0);

        if (workoutDate < this.selectedStartDate || workoutDate > this.selectedEndDate) {
          alert('The date does not fit within the plan`s period of operation.');
          return;
        }
  
        const workoutToSave = {
          ...this.editableWorkout,
          originalTrainingPlanId: this.originalTrainingPlanId,
          updatedTrainingPlanId: this.editableWorkout.trainingPlanId,
        };
  
        this.save.emit(workoutToSave);
        this.selectedStartDate = null;
        this.selectedEndDate = null;
      },
      error: (err) => {
        console.error('Error fetching plan:', err);
        alert('Failed to fetch the training plan. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.cancel.emit();
  }

  deleteWorkout(): void {
    this.delete.emit(this.editableWorkout);
  }


  onNameChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editablePlan.name = inputElement.value.trim();
  }
  
  onStartDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editablePlan.startDate = inputElement.value;
  }
  
  onEndDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.editablePlan.startDate = inputElement.value;
  }

  savePlan(): void {
    if (this.editablePlan.startDate > this.editablePlan.endDate) {
      alert('Start date can`t be later than end date.');
      return;
    }

    if (this.editablePlan.startDate == null ||  this.editablePlan.endDate == null) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (this.editablePlan.name == "") {
      alert('Please fill in all required fields correctly.');
      return;
    }

    this.save.emit(this.editablePlan);
  }

  deletePlan(): void {
    console.log('Deleting plan:', this.editablePlan);
    this.delete.emit(this.editablePlan);
  }
}
