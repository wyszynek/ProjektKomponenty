import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TrainingPlanService } from '../services/training-plan.service';
import { CalendarEventService } from '../services/calendar-event.service';

@Component({
  standalone: true,
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [FullCalendarModule],
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
  };

  constructor(
    private trainingPlanService: TrainingPlanService,
    private eventService: CalendarEventService
  ) {}

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
        const events = plans.flatMap((plan) => {
          const color = generateRandomColor();
          return plan.Workouts.map((workout: any) => ({
            title: `${plan.name}: ${workout.trainingType}`,
            date: workout.date.split('T')[0],
            color: color,
          }));
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
      const calendarApi = this.calendarComponent.getApi(); // Get FullCalendar API
      calendarApi.addEvent(newEvent); // Dynamically add event
    });
  }
}
