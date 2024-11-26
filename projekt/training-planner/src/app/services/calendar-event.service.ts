import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventService {
  private eventSubject = new Subject<any>();
  events$ = this.eventSubject.asObservable();

  addEvent(event: any) {
    this.eventSubject.next(event);
  }
}