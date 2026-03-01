import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldConfig } from './dynamic-form.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between mb-4">
        <input [(ngModel)]="search"
               placeholder="Search..."
               class="border p-2 w-1/3 rounded"/>

        <button (click)="add.emit()"
                class="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <table class="w-full border">
        <thead class="bg-gray-100">
          <tr>
            <th *ngFor="let f of fields" class="p-2 text-left">
              {{ f.label }}
            </th>
            <th class="p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let row of paginated()" class="border-t">
            <td *ngFor="let f of fields" class="p-2">
              <span *ngIf="f.type === 'date'; else normalCell">
                {{ row[f.key] | date:'yyyy-MM-dd' }}
              </span>
              <ng-template #normalCell>
                {{ row[f.key] }}
              </ng-template>
            </td>

            <td class="p-2 space-x-2">
              <button (click)="view.emit(row)" class="text-blue-600">View</button>
              <button (click)="edit.emit(row)" class="text-green-600">Edit</button>
              <button (click)="remove.emit(row)" class="text-red-600">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-between mt-4">
        <button (click)="prevPage()" [disabled]="page === 1">
            Prev
            </button>

        <span>Page {{page}} of {{totalPages()}}</span>

        <button (click)="nextPage()" [disabled]="page === totalPages()">
            Next
            </button>
      </div>

    </div>
  `
})
export class DataTableComponent {

  @Input() data: any[] = [];
  @Input() fields: FieldConfig[] = [];

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  search = '';
  page = 1;
  pageSize = 10;

  filtered() {
    const q = this.search.toLowerCase();
    return this.data.filter(d =>
      Object.values(d).join(' ').toLowerCase().includes(q)
    );
  }

  paginated() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filtered().length / this.pageSize) || 1;
  }

    nextPage() {
        if (this.page < this.totalPages()) {
            this.page++;
        }
    }

    prevPage() {
        if (this.page > 1) {
            this.page--;
        }
    }
}