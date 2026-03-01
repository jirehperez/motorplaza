import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';

import { DataTableComponent } from '../shared/components/data-table.component';
import { DynamicFormComponent, FieldConfig } from '../shared/components/dynamic-form.component';
import { ModalComponent } from '../shared/components/modal.component';

interface Customer {
  id?: number;
  customerName: string;
  address: string;
  contactNumber: string;
  dateOfBirth: string;
  tin: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DataTableComponent,
    DynamicFormComponent,
    ModalComponent
  ],
  templateUrl: './customer.html'
})
export class CustomerComponent {

  apiUrl = `${environment.apiUrl}/customers`;

  customers: Customer[] = [];
  modalOpen = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selected: any = {};

  fields: FieldConfig[] = [
    { key: 'customerName', label: 'Name', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'contactNumber', label: 'Contact', type: 'text' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'tin', label: 'TIN', type: 'text' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.http.get<Customer[]>(this.apiUrl)
      .subscribe(res => this.customers = res);
  }

  openAdd() {
    this.modalMode = 'add';
    this.selected = {};
    this.modalOpen = true;
  }

  openEdit(c: Customer) {
    this.modalMode = 'edit';
    this.selected = { ...c, dateOfBirth: c.dateOfBirth?.split('T')[0] };
    this.modalOpen = true;
  }

  openView(c: Customer) {
    this.modalMode = 'view';
    this.selected = c;
    this.modalOpen = true;
  }

  save(model: Customer) {
    const { id, createdAt, updatedAt, ...payload } = model;

    if (this.modalMode === 'add') {
      this.http.post(this.apiUrl, payload)
        .subscribe(() => this.load());
    }

    if (this.modalMode === 'edit' && model.id) {
      this.http.put(`${this.apiUrl}/${model.id}`, payload)
        .subscribe(() => this.load());
    }

    this.modalOpen = false;
  }

  delete(c: Customer) {
    this.http.delete(`${this.apiUrl}/${c.id}`)
      .subscribe(() => this.load());
  }
}