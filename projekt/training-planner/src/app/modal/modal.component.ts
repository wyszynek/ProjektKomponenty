import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="closeModal()">
  <div class="modal-content">
    <h2>{{ event?.title }}</h2>
    <p>Training Type: {{ event?.extendedProps?.trainingType }}</p>
    <p>Description: {{ event?.extendedProps?.description }}</p>
    <!-- Add any other event data you want to display -->
    <button (click)="closeModal()">Close</button>
  </div>
</div>

  `,
  styleUrls: ['./modal.component.css'],
  imports: [CommonModule],
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() event: any = null;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
