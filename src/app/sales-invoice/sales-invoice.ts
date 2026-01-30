import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../pipes/filter.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { NumberFormatDirective } from '../shared/directives/number-format.directive';

@Component({
  selector: 'app-sales-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, NgSelectModule, NumberFormatDirective],
  templateUrl: './sales-invoice.html',
  styleUrls: ['./sales-invoice.css']
})

export class SalesInvoice {
  salesInvoices: any[] = [];
  customers: any[] = [];
  branches: any[] = [];
  vehicles: any[] = [];
  selectedVehicleDetails: any = null;

  selectedInvoice: any = {
    customer_id: null,
    branch_id: null,
    vehicle_id: null,   // must exist for Vehicle-type invoices
    invoice_type: 'Vehicle',
    invoice_number: '',
    invoice_date: '',
    total_amount_payable: 0,
    parts: []           // must exist for Parts-type invoices
  };
  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  isModalOpen = false;

  searchTerm: string = '';
  customerSearch: string = '';
  branchSearch: string = '';
  vehicleSearch: string = '';

  currentPage: number = 1;
  pageSize: number = 10;

  ngOnInit() {
    this.loadSalesInvoices();
    this.loadCustomers();
    this.loadBranches();
    this.loadVehicles();
  }

  loadSalesInvoices() {
    fetch('http://localhost:3000/sales-invoices')
      .then(res => res.json())
      .then(data => this.salesInvoices = data);
  }

  loadCustomers() {
    fetch('http://localhost:3000/customers')
      .then(res => res.json())
      .then(data => this.customers = data);
  }

  loadBranches() {
    fetch('http://localhost:3000/branches')
      .then(res => res.json())
      .then(data => this.branches = data);
  }

  loadVehicles() {
    fetch('http://localhost:3000/vehicles')
      .then(res => res.json())
      .then(data => this.vehicles = data);
  }

  openModal(mode: 'add' | 'edit' | 'view', invoice: any = null) {
    this.modalMode = mode;
    this.selectedInvoice = invoice
      ? {
          ...invoice,
          invoice_date: invoice.invoice_date
            ? new Date(invoice.invoice_date).toISOString().substring(0, 10)
            : '',
          parts: invoice.parts ? [...invoice.parts] : []
        }
      : {
          customer_id: '',
          branch_id: '',
          invoice_type: 'Vehicle',
          invoice_number: '',
          invoice_date: '',
          total_amount_payable: 0,
          vehicle_id: '',
          parts: [],
          bank_terms: '',
          downpayment: 0,
          amount_financed: 0,
          total_sales_vat_inclusive: 0,
          vat: 0,
          net: 0
        };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalMode = 'add';
  }

  saveInvoice(invoiceForm: any) {
    if (!invoiceForm.valid) {
      return; // Stop if form invalid
    }

    if (this.selectedInvoice) {
      const payload: any = {
        customer_id: Number(this.selectedInvoice.customer_id),
        branch_id: Number(this.selectedInvoice.branch_id),
        vehicle_id: Number(this.selectedInvoice.vehicle_id),
        invoice_type: this.selectedInvoice.invoice_type,
        invoice_number: this.selectedInvoice.invoice_number,
        invoice_date: this.selectedInvoice.invoice_date,
        total_amount_payable: Number(this.selectedInvoice.total_amount_payable),
        total_sales_vat_inclusive: Number(this.selectedInvoice.total_sales_vat_inclusive),
        vat: Number(this.selectedInvoice.vat),
        net: Number(this.selectedInvoice.net),
        bank_terms: this.selectedInvoice.bank_terms,
        downpayment: Number(this.selectedInvoice.downpayment),
        amount_financed: Number(this.selectedInvoice.amount_financed)
      };

      if (
        this.selectedInvoice.invoice_type === 'Parts' &&
        Array.isArray(this.selectedInvoice.parts) &&
        this.selectedInvoice.parts.length > 0
      ) {
        payload.parts = this.selectedInvoice.parts.map((part: any) => ({
          part_number: part.part_number,
          item_description: part.item_description,
          quantity: Number(part.quantity),
          unit_price: Number(part.unit_price),
          total_price: Number(part.total_price)
        }));
      }

      const url = this.selectedInvoice.id
        ? `http://localhost:3000/sales-invoices/${this.selectedInvoice.id}`
        : 'http://localhost:3000/sales-invoices';

      const method = this.selectedInvoice.id ? 'PUT' : 'POST';

      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => this.loadSalesInvoices());

      this.closeModal();
    }
  }


  deleteInvoice(id: number) {
    fetch(`http://localhost:3000/sales-invoices/${id}`, { method: 'DELETE' })
      .then(() => this.loadSalesInvoices());
  }

  getCustomerName(id: number): string {
    const customer = this.customers.find(c => c.id === id);
    return customer ? customer.customer_name : 'Unknown';
  }

  getBranchName(id: number): string {
    const branch = this.branches.find(b => b.id === id);
    return branch ? branch.branch_name : 'Unknown';
  }

  getVehicleName(id: number): string {
    const vehicle = this.vehicles.find(v => v.id === id);
    return vehicle ? vehicle.description : 'Unknown';
  }

  addPart() {
    if (!this.selectedInvoice.parts) {
      this.selectedInvoice.parts = [];
    }
    this.selectedInvoice.parts.push({
      part_number: '',
      item_description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    });
  }

  removePart(index: number) {
    this.selectedInvoice.parts.splice(index, 1);
  }

  updatePartTotal(index: number) {
    const part = this.selectedInvoice.parts[index];
    part.total_price = Number(part.quantity) * Number(part.unit_price);

    // Update invoice totals when parts change
    const partsTotal = this.selectedInvoice.parts.reduce(
      (sum: number, p: any) => sum + Number(p.total_price || 0), 
      0
    );

    this.selectedInvoice.total_sales_vat_inclusive = partsTotal;
    this.updateVATandTotal();
  }

  updateVATandTotal() {
    this.selectedInvoice.vat = (this.selectedInvoice.total_sales_vat_inclusive / 1.12) * 0.12;
    this.selectedInvoice.total_amount_payable = this.selectedInvoice.total_sales_vat_inclusive; // or total_sales_vat_inclusive + vat if VAT should add
    this.selectedInvoice.net = this.selectedInvoice.total_amount_payable - this.selectedInvoice.vat;
  }

  onVehicleChange(vehicle: any) {
    this.selectedVehicleDetails = vehicle;
  }

  @HostListener('window:keydown', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.isModalOpen && event.key === 'Escape') {
      this.closeModal();
    }
  }
}
