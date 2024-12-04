import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarEventService } from '../services/calendar-event.service';

@Component({
  standalone: true,
  selector: 'app-edit-workout', 
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
  imports: [CommonModule, FormsModule],
})
export class EditWorkoutComponent {
  @Input() workout: any | null = null;  // This will receive the workout data
  @Output() cancel = new EventEmitter<void>();  // Event to cancel editing
  @Output() save = new EventEmitter<any>();  // Event to save the edited workout
  @Output() workoutUpdated = new EventEmitter<any>();

  constructor(private eventService: CalendarEventService) {}

  // Handle Save button
  saveWorkout(): void {
    if (this.workout) {
      this.save.emit(this.workout);  
    }
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
