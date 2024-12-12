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

  getActiveTrainingPlans(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/active');
  }

  createTrainingPlan(plan: { name: string; startDate: string; endDate: string }): Observable<any> {
    return this.http.post(this.apiUrl, plan);
  }

  updateTrainingPlan(plan: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${plan.id}`, plan);
  }

  deleteTrainingPlan(plan: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${plan.id}`, plan);
  }

  getPlan(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
