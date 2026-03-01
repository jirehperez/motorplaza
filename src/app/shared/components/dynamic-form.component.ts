import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FieldConfig {
  key: string;
  label: string;
  type: string;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="space-y-3">

      <div *ngFor="let field of fields">
        <input
          [(ngModel)]="model[field.key]"
          [name]="field.key"
          [type]="field.type"
          [placeholder]="field.label"
          class="border p-2 w-full" />
      </div>

      <div class="flex justify-end space-x-2">
        <button type="button"
                (click)="cancel.emit()"
                class="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>

        <button type="button"
                (click)="submit.emit(model)"
                class="px-4 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
      </div>

    </form>
  `
})
export class DynamicFormComponent {
  @Input() fields: FieldConfig[] = [];
  @Input() model: any = {};

  @Output() submit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
}