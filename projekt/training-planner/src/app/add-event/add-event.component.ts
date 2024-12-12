import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CalendarEventService } from '../services/calendar-event.service';
import { TrainingPlanService } from '../services/training-plan.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { intensityRangeValidator } from '../validators/intensity-range.validator';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddEventComponent implements OnInit {
  @Output() planAdded = new EventEmitter<void>();
  @Output() workoutAdded = new EventEmitter<void>();

  eventForm: FormGroup;
  planForm: FormGroup;
  activePlans: any[] = [];
  allPlans: any[] = [];

  showPlanForm: boolean = false;
  showEventForm: boolean = false;
  routerInstance: Router | undefined;

  constructor(
    private eventService: CalendarEventService,
    private planService: TrainingPlanService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.routerInstance = router;
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      selectedPlanId: ['', Validators.required],
      duration: [null, [Validators.required, Validators.min(1)]],
      intensity: [null, [Validators.required, intensityRangeValidator(1,10)]],
      description: [''],
    });

    this.planForm = this.fb.group({
      newPlanName: ['', Validators.required],
      newPlanStartDate: ['', Validators.required],
      newPlanEndDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadActivePlans();
  }

  loadActivePlans(): void {
    this.planService.getActiveTrainingPlans('').subscribe({
      next: (plans) => {
        this.allPlans = plans;
        this.activePlans = plans;
      },
    });
  }

  filterPlansByDate(): void {
    if (!this.eventForm.controls['date'].value) {
      this.activePlans = this.allPlans;
      return;
    }
    const selectedDate = new Date(this.eventForm.controls['date'].value);
    this.activePlans = this.allPlans.filter((plan) => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      return selectedDate >= startDate && selectedDate <= endDate;
    });
  }

  addEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const formValues = this.eventForm.value;
    const selectedPlan = this.activePlans.find(
      (plan) => plan.id === +formValues.selectedPlanId 
    );

    if (!selectedPlan) {
      return; 
    }

    const newEvent = {
      title: formValues.title,
      date: formValues.date,
      trainingPlanId: formValues.selectedPlanId,
      duration: formValues.duration,
      intensity: formValues.intensity,
      description: formValues.description,
    };

    this.eventService.addEvent(newEvent).subscribe({
      next: () => {
        this.resetEventForm();
        this.workoutAdded.emit();
        this.showEventForm = false;
      },
    });
  }

  addNewPlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    const formValues = this.planForm.value;

    const newPlan = {
      name: formValues.newPlanName,
      startDate: formValues.newPlanStartDate,
      endDate: formValues.newPlanEndDate,
    };

    this.planService.createTrainingPlan(newPlan).subscribe({
      next: () => {
        this.resetPlanForm();
        this.loadActivePlans();
        this.showPlanForm = false;
        this.planAdded.emit();
      },
    });
  }

  showTrainingPlanForm(): void {
    this.showPlanForm = true;
    this.planForm.markAllAsTouched();
  }

  showWorkoutForm(): void {
    this.showEventForm = true;
    this.eventForm.markAllAsTouched(); 
  }

  private resetEventForm(): void {
    this.eventForm.reset();
  }

  private resetPlanForm(): void {
    this.planForm.reset();
  }

  navigateToPlans(): void {
    this.router.navigate(['/training-plans']);
  }
}
