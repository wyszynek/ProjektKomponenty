import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarEventService } from '../services/calendar-event.service';
import { TrainingPlanService } from '../services/training-plan.service';
import { intensityRangeValidator } from '../validators/intensity-range.validator';
import { dateRangeValidator } from '../validators/date-range.validator';

@Component({
  standalone: true,
  selector: 'app-edit-workout',
  templateUrl: './edit-event.component.html',
  styleUrls: ['./edit-event.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class EditWorkoutComponent implements OnInit {
  @Input() workout: any; // Otrzymuje dane treningu
  @Input() plan: any;
  @Output() cancel = new EventEmitter<void>(); // Emituje anulowanie edycji
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  availablePlans: any[] = [];
  originalTrainingPlanId: number | undefined;

  selectedStartDate: any;
  selectedEndDate: any;

  workoutForm: FormGroup;
  planForm: FormGroup;

  dateWorkoutError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: CalendarEventService,
    private trainingPlanService: TrainingPlanService
  ) {
    this.workoutForm = this.fb.group({
      id: [null], 
      trainingPlanId: [null], 
      originalTrainingPlanId: [null, Validators.required], // Oryginalny ID planu
      trainingType: ['', Validators.required],
      date: ['', Validators.required],
      intensity: [null, [Validators.required, intensityRangeValidator(1,10)]],
      duration: [null, [Validators.required, Validators.min(1)]],
      description: [''],
    });
    
    this.planForm = this.fb.group(
      {
        id: [null],
        name: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
      },
      { validators: dateRangeValidator } // Dodaj walidator
    );
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadTrainingPlans();

    if (this.workout) {
      if (this.workout) {
        this.workoutForm.patchValue({
          id: this.workout.id,
          trainingPlanId: this.workout.trainingPlanId,
          originalTrainingPlanId: this.workout.trainingPlanId,
          trainingType: this.workout.trainingType,
          date: this.workout.date,
          intensity: this.workout.intensity,
          duration: this.workout.duration,
          description: this.workout.description,
        });
      }

      this.originalTrainingPlanId = this.workout.trainingPlanId;
    }

    if (this.plan) {
      this.planForm.patchValue({
        id: this.plan.id, 
        name: this.plan.name,
        startDate: this.formatDate(this.plan.startDate),
        endDate: this.formatDate(this.plan.endDate),
      });
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

  saveWorkout(): void {
    if (this.workoutForm.invalid) {
      this.workoutForm.markAllAsTouched();
      return;
    }
  
    const workoutData = this.workoutForm.value;
  
    this.trainingPlanService.getPlan(workoutData.trainingPlanId).subscribe({
      next: (plan) => {
        const workoutDate = new Date(workoutData.date);
        const startDate = new Date(plan.startDate);
        const endDate = new Date(plan.endDate);
  
        if (workoutDate < startDate || workoutDate > endDate) {
          this.dateWorkoutError = 'The date does not fit within the plan`s period of operation.';
          return;
        }
  
        // Dane do zapisania, uwzględniające oba identyfikatory
        const workoutToSave = {
          ...workoutData,
          originalTrainingPlanId: this.workoutForm.value.originalTrainingPlanId,
          updatedTrainingPlanId: workoutData.trainingPlanId,
        };
  
        console.log('Workout to Save:', workoutToSave); // Debugowanie
        this.save.emit(workoutToSave);
      },
      error: () => alert('Failed to fetch the training plan. Please try again.'),
    });
  }

  cancelEdit(): void {
    if (this.workout) {
      this.workoutForm.reset();
    }

    if(this.plan) {
      this.planForm.reset();
    }

    this.cancel.emit();
  }

  deleteWorkout(): void {
    const workoutData = this.workoutForm.value;
    this.delete.emit(workoutData);
  }

  savePlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
  
    const planData = this.planForm.value;
  
    if (new Date(planData.startDate) > new Date(planData.endDate)) {
      alert('Start date can`t be later than end date.');
      return;
    }
  
    this.save.emit(planData);
  }

  deletePlan(): void {
    const planData = this.planForm.value;
    console.log('Deleting plan:', planData);
    this.delete.emit(planData);
  }
}
