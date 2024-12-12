import { Component, OnInit } from '@angular/core';
import { TrainingPlanService } from '../services/training-plan.service';
import { CommonModule } from '@angular/common';
import { EditWorkoutComponent } from '../edit-event/edit-event.component';
@Component({
  standalone: true,
  selector: 'app-training-plans',
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.css'],
  imports: [CommonModule, EditWorkoutComponent],
})
export class TrainingPlansComponent implements OnInit {
  trainingPlans: any[] = [];
  selectedPlan: any = null;
  constructor(private trainingPlanService: TrainingPlanService) {}

  ngOnInit(): void {
    this.loadTrainingPlans();
  }

  loadTrainingPlans(): void {
    this.trainingPlanService.getTrainingPlans().subscribe({
      next: (plans) => {
        this.trainingPlans = plans;
      },
      error: (err) => console.error('Error fetching plans:', err),
    });
  }
  sortState: { [key: string]: 'asc' | 'desc' | null } = {
    name: null,
    startDate: null,
    endDate: null
  };
  onEdit(plan: any): void {
    console.log('Start:', plan.startDate);
    console.log('End:', plan.endDate);
    // Ustawia wybrany plan, który zostanie edytowany w komponencie EditWorkoutComponent
    this.selectedPlan = { ...plan }; // Tworzymy kopię planu, aby nie modyfikować oryginału
  }

  sortTable(field: string) {
    const currentDirection = this.sortState[field];
    Object.keys(this.sortState).forEach(key => {
      this.sortState[key] = key === field ? (currentDirection === 'asc' ? 'desc' : 'asc') : null;
    });

    const sortDirection = this.sortState[field];

    this.trainingPlans.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(field: string): string {
    const direction = this.sortState[field];
    if (direction === 'asc') return 'sort-asc-icon';
    if (direction === 'desc') return 'sort-desc-icon';
    return '';
  }
}
