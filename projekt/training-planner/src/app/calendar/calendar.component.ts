import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TrainingPlanService } from '../services/training-plan.service';

@Component({
  standalone: true,
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [FullCalendarModule],
})
export class CalendarComponent implements OnInit {
  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    firstDay: 1,
    events: [], 
    editable: true,
    selectable: true,
  };

  constructor(private trainingPlanService: TrainingPlanService) {}
  ngOnInit(): void {
    this.loadTrainingPlans();
  }

  loadTrainingPlans(): void {
    this.trainingPlanService.getTrainingPlans().subscribe({
      next: (plans) => {
        const events = plans.flatMap((plan) =>
          plan.Workouts.map((workout: any) => ({
            title: `${plan.name}: ${workout.trainingType}`,
            date: workout.date.split('T')[0],
          }))
        );
        this.calendarOptions.events = events;
      },
      error: (err) => {
        console.error('Error loading plans:', err);
      },
    });
  }
  
}
