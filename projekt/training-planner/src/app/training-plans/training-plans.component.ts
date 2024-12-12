import { Component, OnInit } from '@angular/core';
import { TrainingPlanService } from '../services/training-plan.service';
import { CommonModule } from '@angular/common';
import { EditWorkoutComponent } from '../edit-event/edit-event.component';
import { Router } from '@angular/router';
import { ChangeColorDirective } from '../directives/change-color.directive';

@Component({
  standalone: true,
  selector: 'app-training-plans',
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.css'],
  imports: [CommonModule, EditWorkoutComponent,ChangeColorDirective],
})
export class TrainingPlansComponent implements OnInit {
  trainingPlans: any[] = [];
  selectedPlan: any = null;
  isEditModalOpen = false;
  routerInstance: Router | undefined;

  constructor(private trainingPlanService: TrainingPlanService, private router: Router) {
    this.routerInstance = router;
  }

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

  onEdit(plan: any): void {
    console.log('Start:', plan.startDate);
    console.log('End:', plan.endDate);
    this.selectedPlan = { ...plan }; 
  }

  handleSaveEditPlan(updatedPlan: any): void {
    console.log('Zapisano plan:', updatedPlan);

    this.trainingPlanService.updateTrainingPlan(updatedPlan).subscribe({
      next: () => {
        console.log('Plan zaktualizowany');
        this.selectedPlan = null;
        this.loadTrainingPlans();
        this.isEditModalOpen = false;
      },
      error: (err) => console.error('Błąd aktualizacji planu:', err),
    });
  }

  handleDeletePlan(plan: any): void {
    if (confirm('Are you sure you want to delete this workout?')) {
      this.trainingPlanService.deleteTrainingPlan(plan).subscribe(
        () => {
          // Po pomyślnym usunięciu, zamykamy modal i usuwamy event z kalendarza
          console.log('Workout deleted successfully');
          this.isEditModalOpen = false;

          this.selectedPlan = null;
          this.loadTrainingPlans();
          this.isEditModalOpen = false;
        },
        (error) => {
          console.error('Error deleting workout:', error);
          // Obsługa błędów
        }
      );
    }
  }

  handleCancelEditPlan(): void {
    this.selectedPlan = null;
    this.isEditModalOpen = false;
  }

  sortState: { [key: string]: 'asc' | 'desc' | null } = {
    name: null,
    startDate: null,
    endDate: null
  };

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

  navigateToPlans(): void {
    this.router.navigate(['/']);
  }
}
