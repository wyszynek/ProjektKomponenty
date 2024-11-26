import { Component, EventEmitter, Output } from '@angular/core';
import { CalendarEventService } from '../services/calendar-event.service';
import { FormsModule } from '@angular/forms'; // Importuj FormsModule
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css'],
  imports: [CommonModule, FormsModule]
})
export class AddEventComponent {
  title = '';
  date = '';

  constructor(private eventService: CalendarEventService) {}

  addEvent(): void {
    if (this.title && this.date) {
      const newEvent = { title: this.title, date: this.date, color: '#00aaff' };
      this.eventService.addEvent(newEvent);
      this.title = '';
      this.date = '';
    }
  }
}
