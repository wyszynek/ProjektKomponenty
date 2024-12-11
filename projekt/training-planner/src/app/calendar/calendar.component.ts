import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FullCalendarModule,
  FullCalendarComponent,
} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TrainingPlanService } from '../services/training-plan.service';
import { CalendarEventService } from '../services/calendar-event.service';
import { ModalComponent } from '../modal/modal.component';
import { EditWorkoutComponent } from '../edit-event/edit-event.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NONE_TYPE } from '@angular/compiler';
import { AddEventComponent } from "../add-event/add-event.component";

@Component({
  standalone: true,
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  imports: [
    FullCalendarModule,
    ModalComponent,
    EditWorkoutComponent,
    CommonModule,
    HttpClientModule,
    AddEventComponent
],
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions: any = {
    themeSystem: 'bootstrap5',
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    firstDay: 1,
    events: [],
    editable: true,
    selectable: true,
    eventDrop: (info: any) => this.handleEventDrop(info),
    eventDidMount: (info: any) => this.handleEventDidMount(info),
    eventClick: (info: any) => this.handleEventClick(info),
    aspectRatio: 3,
  };

  isModalOpen = false;
  selectedEvent: any = null;
  hoverTimeout: any = null;
  leaveTimeout: any = null;

  isEditModalOpen = false;
  selectedWorkout: any = null;

  trainingPlans: any[] = [];
  selectedPlanIds: string[] = [];

  selectedPlan: any = null;

  constructor(
    private trainingPlanService: TrainingPlanService,
    private eventService: CalendarEventService,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    this.loadTrainingPlans();
    this.subscribeToNewEvents();
    this.refreshPlans();
  }

  refreshPlans(): void {
    this.trainingPlanService.getActiveTrainingPlans('').subscribe({
      next: (plans) => {
        this.trainingPlans = plans;
      },
      error: (err) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  loadTrainingPlans(): void {
    const generateRandomColor = (): string => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    this.trainingPlanService.getTrainingPlans().subscribe({
      next: (plans) => {
        console.log('Raw plans:', plans);
        this.trainingPlans = plans.map((plan) => ({
          ...plan,
          color: generateRandomColor(), // Generate and store color for each plan
        }));

        const events = this.trainingPlans.flatMap((plan) =>
          plan.Workouts.map((workout: any) => ({
            id: workout.id,
            title: `${plan.name}: ${workout.trainingType}`,
            date: workout.date.split('T')[0],
            intensity: workout.intensity,
            color: plan.color,
            description: workout.description,
            trainingDuration: workout.duration,
            extendedProps: {
              trainingPlanId: plan.id,
              workoutId: workout.id,
              trainingType: workout.trainingType,
              intensity: workout.intensity,
              description: workout.description,
              trainingDuration: workout.duration,
              date: workout.date,
            },
          }))
        );

        this.calendarOptions.events = events;
        this.refreshCalendar();
      },
      error: (err) => {
        console.error('Error loading plans:', err);
      },
    });
  }

  handleEventDrop(info: any): void {
    const event = info.event;

    const updatedWorkout = {
      id: +event.id, // Convert to number
      newDate: event.startStr,
      trainingPlanId: +event.extendedProps.trainingPlanId, // Convert to number
    };

    this.eventService
      .updateWorkoutDate(
        updatedWorkout.trainingPlanId,
        updatedWorkout.id,
        updatedWorkout.newDate
      )
      .subscribe({
        next: () => {
          console.log('Workout date updated successfully');
        },
        error: (err) => {
          console.error('Error updating workout date:', err);
          info.revert(); // Revert event drag on error
        },
      });
  }

  filterTrainingPlans(event: Event): void {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    const selectedPlanIds = Array.from(selectedOptions).map(
      (option) => option.value
    );

    if (selectedPlanIds.includes('')) {
      this.loadTrainingPlans();
    } else {
      const filteredEvents = this.trainingPlans
        .filter((plan) => {
          return selectedPlanIds.includes(String(plan.id));
        })
        .flatMap((plan) =>
          plan.Workouts.map((workout: any) => ({
            id: workout.id,
            title: `${plan.name}: ${workout.trainingType}`,
            date: workout.date.split('T')[0],
            intensity: workout.intensity,
            color: plan.color,
            description: workout.description,
            trainingDuration: workout.duration,
            extendedProps: {
              trainingPlanId: plan.id,
              workoutId: workout.id,
              trainingType: workout.trainingType,
              intensity: workout.intensity,
              description: workout.description,
              trainingDuration: workout.duration,
            },
          }))
        );

      this.calendarOptions.events = filteredEvents;
      this.refreshCalendar();
    }
  }

  handleEventClick(info: any): void {
    const event = info.event;
    this.selectedWorkout = {
      id: event.id,
      trainingType: event.extendedProps.trainingType,
      date: event.startStr,
      intensity: event.extendedProps.intensity,
      description: event.extendedProps.description,
      duration: event.extendedProps.trainingDuration,
      trainingPlanId: event.extendedProps.trainingPlanId,
      workoutId: event.extendedProps.workoutId,
    };

    this.isEditModalOpen = true;
  }

  handleCancelEdit(): void {
    this.selectedWorkout = null;
    this.isEditModalOpen = false;
  }

  handleDeleteWorkout(workout: any): void {
    if (confirm('Are you sure you want to delete this workout?')) {
      this.eventService
        .deleteWorkout(workout.trainingPlanId, workout.id)
        .subscribe(
          () => {
            // Po pomyślnym usunięciu, zamykamy modal i usuwamy event z kalendarza
            console.log('Workout deleted successfully');
            this.isEditModalOpen = false;

            // Usuwamy wydarzenie z kalendarza
            const calendarApi = this.calendarComponent.getApi();
            const event = calendarApi.getEventById(workout.workoutId); // Pobieramy wydarzenie po ID
            if (event) {
              event.remove(); // Usuwamy wydarzenie z kalendarza
            }

            this.selectedWorkout = null;
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

  handleSaveEdit(updatedWorkout: any): void {
    const originalTrainingPlanId = updatedWorkout.originalTrainingPlanId; // Oryginalny ID planu
    console.log('stare id: ', originalTrainingPlanId);

    const updatedTrainingPlanId = updatedWorkout.trainingPlanId; // Nowy plan (po zmianie)
    console.log('nowe id: ', updatedTrainingPlanId);

    const workoutId = updatedWorkout.id;

    // Jeśli plan został zmieniony, wykonaj PUT do starego planu i przekazuj nowe ID planu
    if (originalTrainingPlanId !== updatedTrainingPlanId) {
      this.eventService
        .updateWorkoutNewPlan(
          originalTrainingPlanId,
          workoutId,
          updatedTrainingPlanId,
          updatedWorkout
        )
        .subscribe({
          next: (response) => {
            console.log('Workout updated successfully:', response);
            this.selectedWorkout = null;
            this.loadTrainingPlans();
            this.isEditModalOpen = false;
          },
          error: (err) => {
            console.error('Error updating workout:', err);
          },
        });
    } else {
      // Jeśli plan się nie zmienił, tylko zaktualizuj workout w obrębie tego samego planu
      this.eventService
        .updateWorkout(updatedTrainingPlanId, workoutId, updatedWorkout)
        .subscribe({
          next: (response) => {
            console.log('Workout updated successfully:', response);
            this.selectedWorkout = null; // Resetowanie po zapisaniu
            this.loadTrainingPlans(); // Ponowne załadowanie danych do kalendarza
            this.isEditModalOpen = false; // Zamknięcie modal edycji
          },
          error: (err) => {
            console.error('Error updating workout:', err);
          },
        });
    }
  }

  handleCancelEditPlan(): void {
    this.selectedPlan = null;
    this.isEditModalOpen = false;
  }

  onEdit(plan: any): void {
    console.log('Start:', plan.startDate);
    console.log('End:', plan.endDate);
    // Ustawia wybrany plan, który zostanie edytowany w komponencie EditWorkoutComponent
    this.selectedPlan = { ...plan }; // Tworzymy kopię planu, aby nie modyfikować oryginału
  }

  handleSaveEditPlan(updatedPlan: any): void {
    console.log('Zapisano plan:', updatedPlan);

    this.trainingPlanService.updateTrainingPlan(updatedPlan).subscribe({
      next: () => {
        console.log('Plan zaktualizowany');
        this.selectedPlan = null;
        this.loadTrainingPlans();
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

  subscribeToNewEvents(): void {
    this.eventService.events$.subscribe((newEvent) => {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.addEvent(newEvent);
    });
  }

  handleEventDidMount(info: any): void {
    const eventElement = info.el;

    eventElement.addEventListener('mouseenter', () =>
      this.handleEventMouseEnter(info)
    );

    eventElement.addEventListener('mouseleave', () =>
      this.handleEventMouseLeave(info)
    );
  }

  handleEventMouseEnter(info: any): void {
    this.selectedEvent = info.event;
    console.log(this.selectedEvent);

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    this.hoverTimeout = setTimeout(() => {
      this.isModalOpen = true;
      this.addClickOutsideListener();
    }, 1500);
  }

  handleEventMouseLeave(info: any): void {
    this.selectedEvent = info.event;
    if (this.hoverTimeout < 1500) {
      clearTimeout(this.hoverTimeout);
    }
  }

  addClickOutsideListener(): void {
    const modalElement = document.querySelector('.modal');
    const bodyElement = document.querySelector('body');

    const closeModal = (event: MouseEvent) => {
      if (modalElement && !modalElement.contains(event.target as Node)) {
        this.isModalOpen = false;
        bodyElement?.removeEventListener('click', closeModal);
      }
    };

    bodyElement?.addEventListener('click', closeModal);
  }

  refreshCalendar(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.refetchEvents();
  }
}
