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
export class EditWorkoutComponent implements OnInit{
  @Input() workout: any;  // This will receive the workout data
  @Output() cancel = new EventEmitter<void>();  // Event to cancel editing
  @Output() save = new EventEmitter<any>();  // Event to save the edited workout
  @Output() workoutUpdated = new EventEmitter<any>();

  availablePlans: any[] = [];
  originalTrainingPlanId: number | undefined;

  constructor(private eventService: CalendarEventService, private trainingPlanService: TrainingPlanService) {}

  ngOnInit(): void {
    this.loadTrainingPlans();
    this.originalTrainingPlanId = this.workout.trainingPlanId;
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

  // Emituj zapisane dane
  saveWorkout(): void {
    if(this.workout.date == null) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    if (this.workout.intensity == null || this.workout.intensity > 10 || this.workout.intensity < 1) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    else if(this.workout.duration == null || this.workout.duration < 1) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    else if(this.workout.trainingType == null) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    // Jeśli zmieniono plan, wyślij oryginalne ID planu (jeśli inne niż wybrane)
    const workoutToSave = {
      ...this.workout,
      originalTrainingPlanId: this.originalTrainingPlanId, // Dodaj oryginalne ID planu
      updatedTrainingPlanId: this.workout.trainingPlanId,  // Dodaj nowe ID planu
    };

    this.save.emit(workoutToSave);  // Zmienione workout z oryginalnym planem
  }

  cancelEdit(): void {
    this.cancel.emit();  
  }

  deleteWorkout(): void {
    if (this.workout) {
      if (confirm('Are you sure you want to delete this workout?')) {
        this.eventService.deleteWorkout(this.workout.trainingPlanId, this.workout.id)
          .subscribe({
            next: () => {
              console.log('Workout deleted');
              this.workout = null;  // Clear workout after deletion
              this.workoutUpdated.emit(null);  // Inform parent that the workout was deleted
            },
            error: (err) => {
              console.error('Error deleting workout:', err);
            }
          });
      }
    }
  }
}
