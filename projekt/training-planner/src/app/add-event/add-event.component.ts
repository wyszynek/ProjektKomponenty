import { Component, OnInit } from '@angular/core';
import { CalendarEventService } from '../services/calendar-event.service';
import { TrainingPlanService } from '../services/training-plan.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AddEventComponent implements OnInit {
  title = '';
  date = '';
  selectedPlanId: string = '';
  duration: number | null = null;
  intensity: number | null = null;
  description = '';
  activePlans: any[] = [];
  newPlanName = '';
  newPlanStartDate = '';
  newPlanEndDate = '';

  showPlanForm: boolean = false;
  showEventForm: boolean = false;

  constructor(
    private eventService: CalendarEventService,
    private planService: TrainingPlanService
  ) {}

  ngOnInit(): void {
    this.loadActivePlans();
  }

  allPlans: any[] = [];

loadActivePlans(): void {
  this.planService.getActiveTrainingPlans('').subscribe({
    next: (plans) => {
      this.allPlans = plans;
      this.activePlans = plans;
    },
    error: (err) => {
      console.error('Error fetching active plans:', err);
    },
  });
}

filterPlansByDate(): void {
  if (!this.date) {
    this.activePlans = this.allPlans;
    return;
  }
  const selectedDate = new Date(this.date);
  this.activePlans = this.allPlans.filter((plan) => {
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);

    return selectedDate >= startDate && selectedDate <= endDate;
  });
}

  
addEvent(): void {
  if (this.title && this.date && this.selectedPlanId && this.duration && this.intensity) {
    const selectedPlan = this.activePlans.find(plan => plan.id === +this.selectedPlanId);

    if (!selectedPlan) {
      console.error('Selected plan not found.');
      return;
    }

    const newEvent = {
      title: `${selectedPlan.name}: ${this.title}`,
      date: this.date,
      trainingPlanId: this.selectedPlanId,
      duration: this.duration,
      intensity: this.intensity,
      description: this.description,
    };

    console.log('Adding new event:', newEvent);

    this.eventService.addEvent(newEvent).subscribe({
      next: (response) => {
        console.log('Event added successfully.');
        this.resetEventForm();
        this.eventService.emitNewEvent({
          id: response.id,
          title: newEvent.title,
          date: newEvent.date,
          trainingPlanId: newEvent.trainingPlanId,
          duration: newEvent.duration,
          intensity: newEvent.intensity,
          description: newEvent.description,
        });
        this.showEventForm = false;
      },
      error: (err) => {
        console.error('Error adding event:', err);
      },
    });
  } else {
    console.error('Missing required fields for event:', {
      title: this.title,
      date: this.date,
      selectedPlanId: this.selectedPlanId,
      duration: this.duration,
      intensity: this.intensity,
    });
  }
}



  addNewPlan(): void {
    if (this.newPlanName && this.newPlanStartDate && this.newPlanEndDate) {
      const newPlan = {
        name: this.newPlanName,
        startDate: this.newPlanStartDate,
        endDate: this.newPlanEndDate,
      };

      console.log('Adding new training plan:', newPlan);

      this.planService.createTrainingPlan(newPlan).subscribe({
        next: () => {
          console.log('New training plan added successfully.');
          this.resetPlanForm();
          this.loadActivePlans();
          this.showPlanForm = false;
        },
        error: (err) => {
          console.error('Error adding new training plan:', err);
        },
      });
    } else {
      console.error('Missing required fields for new plan:', {
        newPlanName: this.newPlanName,
        newPlanStartDate: this.newPlanStartDate,
        newPlanEndDate: this.newPlanEndDate,
      });
    }
  }

  private resetEventForm(): void {
    this.title = '';
    this.date = '';
    this.selectedPlanId = '';
    this.duration = null;
    this.intensity = null;
    this.description = '';
  }

  private resetPlanForm(): void {
    this.newPlanName = '';
    this.newPlanStartDate = '';
    this.newPlanEndDate = '';
  }
}
