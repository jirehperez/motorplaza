import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style="z-index: 10;">
      <div class="bg-white p-6 rounded shadow w-1/2">
        <h2 class="text-lg font-semibold mb-4">{{ title }}</h2>

        <ng-content></ng-content>

        <div class="flex justify-end mt-4">
          <button (click)="close.emit()"
                  class="px-4 py-2 bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}