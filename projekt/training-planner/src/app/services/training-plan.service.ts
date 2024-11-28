import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingPlanService {
  private apiUrl = 'http://localhost:7777/plans';

  constructor(private http: HttpClient) {}

  getTrainingPlans(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getActiveTrainingPlans(date: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/active');
  }

  createTrainingPlan(plan: { name: string; startDate: string; endDate: string }): Observable<any> {
    return this.http.post(this.apiUrl, plan);
  }
}
