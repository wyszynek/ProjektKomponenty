import { Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { TrainingPlansComponent } from './training-plans/training-plans.component';

export const routes: Routes = [
    { path: '', component: CalendarComponent },
    { path: 'training-plans', component: TrainingPlansComponent },
];
