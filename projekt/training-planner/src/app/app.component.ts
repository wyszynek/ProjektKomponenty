import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; 
import { CalendarComponent } from './calendar/calendar.component';
import { TrainingPlansComponent } from './training-plans/training-plans.component';

@Component({
  selector: 'app-root',
  standalone: true,  
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, CalendarComponent, TrainingPlansComponent],
})
export class AppComponent {
  title = 'Angular Standalone App';
}