import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface CustomerModel {
  id?: number;
  customer_name: string;
  address: string;
  contact_number: string;
  date_of_birth: string;
  tin: string;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './customer.html',
  styleUrls: ['./customer.css'],
})
export class Customer {
  search = '';
  page = 1;
  pageSize = 10;
  customers: CustomerModel[] = [];

  // Modal state
  modalOpen = false;
  modalMode: 'view' | 'edit' | 'add' = 'view';
  selected: CustomerModel = Customer.emptyCustomer();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.http.get<CustomerModel[]>('http://localhost:3000/customers')
      .subscribe(data => this.customers = data);
  }

  // Helpers
  static emptyCustomer(): CustomerModel {
    return {
      customer_name: '',
      address: '',
      contact_number: '',
      date_of_birth: '',
      tin: '',
    };
  }

  get filtered() {
    const q = this.search.trim().toLowerCase();
    return this.customers.filter(c =>
      [c.customer_name, c.address, c.contact_number, c.date_of_birth, c.tin]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  get paginated() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filtered.length / this.pageSize) || 1;
  }

  // Modal Actions
  openAdd() {
    this.modalMode = 'add';
    this.selected = Customer.emptyCustomer();
    this.modalOpen = true;
  }

  openEdit(c: CustomerModel) {
    this.modalMode = 'edit';
    this.selected = { ...c };
    this.modalOpen = true;
  }

  openView(c: CustomerModel) {
    this.modalMode = 'view';
    this.selected = { ...c };
    this.modalOpen = true;
  }

  save() {
    if (this.modalMode === 'add') {
      this.http.post('http://localhost:3000/customers', this.selected)
        .subscribe(() => this.loadCustomers());
    }
    if (this.modalMode === 'edit' && this.selected.id) {
      this.http.put(`http://localhost:3000/customers/${this.selected.id}`, this.selected)
        .subscribe(() => this.loadCustomers());
    }
    console.log("JIREH", this.selected);
    this.closeModal();  
  }

  delete(c: CustomerModel) {
    if (c.id) {
      this.http.delete(`http://localhost:3000/customers/${c.id}`)
        .subscribe(() => this.loadCustomers());
    }
  }


  closeModal() {
    this.modalOpen = false;
  }
}
