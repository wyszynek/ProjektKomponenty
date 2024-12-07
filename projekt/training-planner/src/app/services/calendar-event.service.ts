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
    return this.http.post(this.apiUrl, {
      trainingPlanId: event.trainingPlanId,
      date: event.date,
      trainingType: event.title,
      duration: event.duration,
      intensity: event.intensity,
      description: event.description,
    });
  }

  private baseUrl = 'http://localhost:7777/plans';
  updateWorkout(planId: number, workoutId: number, updatedWorkout: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${planId}/workouts/${workoutId}`, {
      trainingType: updatedWorkout.trainingType,
      date: updatedWorkout.date,
      duration: updatedWorkout.duration,
      intensity: updatedWorkout.intensity,
      description: updatedWorkout.description,
    });
  }

  updateWorkoutNewPlan(
    originalTrainingPlanId: number,
    workoutId: number,
    updatedTrainingPlanId: number,
    updatedWorkout: any
  ): Observable<any> {
    return this.http.put(
      `http://localhost:7777/plans/${originalTrainingPlanId}/workouts/${workoutId}/move/${updatedTrainingPlanId}`,
      updatedWorkout
    );
  }

  getWorkoutDetails(planId: number, workoutId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${planId}/workouts/${workoutId}`);
  }

  deleteWorkout(planId: number, workoutId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${planId}/workouts/${workoutId}`);
  }

  emitNewEvent(event: any): void {
    this.eventsSubject.next(event);
  }
}
