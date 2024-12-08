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
  @Output() cancel = new EventEmitter<void>(); // Emituje anulowanie edycji
  @Output() save = new EventEmitter<any>(); // Emituje zapisanie edytowanego treningu
  @Output() workoutUpdated = new EventEmitter<any>();

  availablePlans: any[] = [];
  originalTrainingPlanId: number | undefined;
  editableWorkout: any = {};

  constructor(private eventService: CalendarEventService, private trainingPlanService: TrainingPlanService) {}

  ngOnInit(): void {
    this.loadTrainingPlans();
    this.originalTrainingPlanId = this.workout.trainingPlanId;
    this.editableWorkout = { ...this.workout };
  }

  loadTrainingPlans(): void {
    this.trainingPlanService.getTrainingPlans().subscribe({
      next: (plans) => {
        this.availablePlans = plans.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
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

  onTrainingPlanChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedPlanId = parseInt(selectElement.value, 10);
    this.editableWorkout.trainingPlanId = isNaN(selectedPlanId) ? null : selectedPlanId;
  }

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

    if (this.editableWorkout.intensity == null || this.editableWorkout.intensity > 10 || this.editableWorkout.intensity < 1) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (this.editableWorkout.duration < 1 || this.editableWorkout.duration == null) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    const workoutToSave = {
      ...this.editableWorkout,
      originalTrainingPlanId: this.originalTrainingPlanId,
      updatedTrainingPlanId: this.editableWorkout.trainingPlanId,
    };

    this.save.emit(workoutToSave);
  }

  cancelEdit(): void {
    this.cancel.emit();
  }

  deleteWorkout(): void {
    if (this.workout) {
      if (confirm('Are you sure you want to delete this workout?')) {
        this.eventService.deleteWorkout(this.editableWorkout.trainingPlanId, this.editableWorkout.id).subscribe({
          next: () => {
            console.log('Workout deleted');
            this.workout = null;
            this.workoutUpdated.emit(null);
          },
          error: (err) => {
            console.error('Error deleting workout:', err);
          },
        });
      }
    }
  }
}
