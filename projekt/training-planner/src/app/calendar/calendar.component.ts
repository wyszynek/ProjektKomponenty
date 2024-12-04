import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TrainingPlanService } from '../services/training-plan.service';
import { CalendarEventService } from '../services/calendar-event.service';
import { ModalComponent } from '../modal/modal.component';
import { EditWorkoutComponent } from '../edit-event/edit-event.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [FullCalendarModule, ModalComponent, EditWorkoutComponent, CommonModule, HttpClientModule],
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    firstDay: 1,
    events: [], 
    editable: true,
    selectable: true,
    eventMouseEnter: this.handleEventMouseEnter.bind(this),
    eventMouseLeave: this.handleEventMouseLeave.bind(this),
    eventClick: this.handleEventClick.bind(this),
    aspectRatio: 3,
  };

  isModalOpen = false;
  selectedEvent: any = null;
  hoverTimeout: any = null;
  leaveTimeout: any = null;

  isEditModalOpen = false;
  selectedWorkout: any = null;

  constructor(private trainingPlanService: TrainingPlanService, private eventService: CalendarEventService, private http: HttpClient) {}
  ngOnInit(): void {
    this.loadTrainingPlans();
    this.subscribeToNewEvents();
  }

  loadTrainingPlans(): void {
    const generateRandomColor = (): string => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
  
    this.trainingPlanService.getTrainingPlans().subscribe({
      next: (plans) => {
        console.log('Raw plans:', plans);
        const events = plans.flatMap((plan) => {
          const color = generateRandomColor();
          return plan.Workouts.map((workout: any) => {
            return {
              id: workout.id, 
              title: `${plan.name}: ${workout.trainingType}`,
              date: workout.date.split('T')[0],
              intensity: workout.intensity,
              color: color,
              description: workout.description,
              trainingDuration: workout.duration,
              extendedProps: {
                trainingPlanId: plan.id, 
                workoutId: workout.id,   
                trainingType: workout.trainingType,
                intensity: workout.intensity,
                description: workout.description,
                trainingDuration: workout.duration
              }
            };
          });
        });
        this.calendarOptions.events = events;
      },
      error: (err) => {
        console.error('Error loading plans:', err);
      },
    });
  }

  handleEventClick(info: any): void {
    const event = info.event;
    this.selectedWorkout = {
      id: event.id,
      trainingType: event.extendedProps.trainingType, 
      date: event.startStr,
      intensity: event.extendedProps.intensity,
      description: event.extendedProps.description,
      duration: event.extendedProps.trainingDuration,
      trainingPlanId: event.extendedProps.trainingPlanId,
      workoutId: event.extendedProps.workoutId,
    };
  
    this.isEditModalOpen = true;
  }

  handleCancelEdit(): void {
    this.selectedWorkout = null; 
  }

  handleDeleteWorkout(): void {
    if (this.selectedWorkout) {
      if (confirm('Are you sure you want to delete this workout?')) {
        this.eventService.deleteWorkout(this.selectedWorkout.trainingPlanId, this.selectedWorkout.id)
          .subscribe({
            next: () => {
              console.log('Workout deleted');
              this.selectedWorkout = null;
  
              const calendarApi = this.calendarComponent.getApi();
              const event = calendarApi.getEventById(this.selectedWorkout.id);
              if (event) {
                event.remove();  
              }

              this.loadTrainingPlans();  
              this.isEditModalOpen = false; 
            },
            error: (err) => {
              console.error('Error deleting workout:', err);
            }
          });
      }
    }
  }

  handleSaveEdit(updatedWorkout: any): void {
    const planId = updatedWorkout.trainingPlanId;  // ID planu treningowego
    const workoutId = updatedWorkout.workoutId;    // ID workoutu
  
    // Wyślij PUT request do API, aby zaktualizować workout
    this.eventService.updateWorkout(planId, workoutId, updatedWorkout).subscribe({
      next: (response) => {
        console.log('Workout updated successfully:', response);
        this.selectedWorkout = null; 
        this.loadTrainingPlans(); 
        this.isEditModalOpen = false;
      },
      error: (err) => {
        console.error('Error updating workout:', err);
      },
    });
  }

  subscribeToNewEvents(): void {
    this.eventService.events$.subscribe((newEvent) => {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.addEvent(newEvent);
    });
  }
  
  handleEventMouseEnter(info: any) {
    this.hoverTimeout = setTimeout(() => {
      this.selectedEvent = info.event;
      this.isModalOpen = true;
    }, 1500);
    
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
  }

  handleEventMouseLeave(info: any) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.leaveTimeout = setTimeout(() => {
      this.isModalOpen = false;
    }, 1000);
  }
}