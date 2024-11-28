import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventService {
  private apiUrl = 'http://localhost:7777/workouts';
  private eventsSubject = new Subject<any>();

  events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  addEvent(event: {
    title: string;
    date: string;
    trainingPlanId: string;
    duration: number;
    intensity: number;
    description: string;
  }): Observable<any> {
    console.log('Sending event to backend:', event);
    return this.http.post(this.apiUrl, {
      trainingPlanId: event.trainingPlanId,
      date: event.date,
      trainingType: event.title,
      duration: event.duration,
      intensity: event.intensity,
      description: event.description,
    });
  }
  
  
  
  emitNewEvent(event: any): void {
    this.eventsSubject.next(event);
  }
}