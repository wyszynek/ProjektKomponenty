import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TrainingPlanService } from '../services/training-plan.service';
import { CalendarEventService } from '../services/calendar-event.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  standalone: true,
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [FullCalendarModule, ModalComponent],
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
    aspectRatio: 3,
  };

  isModalOpen = false;
  selectedEvent: any = null;
  hoverTimeout: any = null;
  leaveTimeout: any = null;

  constructor(private trainingPlanService: TrainingPlanService, private eventService: CalendarEventService) {}
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
            console.log('Raw workout:', workout);
            return {
              identifier: workout.id,
              title: `${plan.name}: ${workout.trainingType}`,
              date: workout.date.split('T')[0],
              intensity: workout.intensity,
              color: color,
              description: workout.description,
              trainingDuration: workout.duration,
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