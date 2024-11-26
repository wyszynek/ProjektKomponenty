import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  standalone: true,
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [
    CommonModule,
    FullCalendarModule, // Import modułu kalendarza
  ],
})
export class CalendarComponent {
  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin], // Wtyczki
    initialView: 'dayGridMonth',
    events: [
      { title: 'Event 1', date: '2024-11-21' },
      { title: 'Event 2', date: '2024-11-22' },
    ],
    editable: true,
    selectable: true,
  };
}