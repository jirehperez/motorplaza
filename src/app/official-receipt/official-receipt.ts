// src/app/official-receipt/official-receipt.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FilterPipe } from '../pipes/filter.pipe';

@Component({
  selector: 'app-official-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, FilterPipe],
  templateUrl: './official-receipt.html',
})
export class OfficialReceipt {
  receipts: any[] = [];
  customers: any[] = [];
  branches: any[] = [];
  invoices: any[] = [];        // invoices for selected customer
  appliedInvoices: { sales_invoice_id: number; applied_amount: number }[] = [];
  formSubmitted = false;

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';

  selectedReceipt: any = {
    customer_id: null,
    branch_id: null,
    receipt_number: '',
    receipt_date: '',
    amount: null,
    note: '',
  };

  ngOnInit() {
    this.loadReceipts();
    this.loadCustomers();
    this.loadBranches();
  }

  loadReceipts() {
    fetch('http://localhost:3000/official-receipts')
      .then(res => res.json())
      .then(data => this.receipts = data);
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


  openModal(mode: 'add' | 'edit' | 'view', receipt: any = null) {
    this.modalMode = mode;
    this.isModalOpen = true;

    if (mode === 'add') {
      this.selectedReceipt = {
        customer_id: null,
        branch_id: null,
        receipt_number: '',
        receipt_date: '',
        amount: null,
        note: '',
        payments: [],
      };
      this.appliedInvoices = [];
      this.invoices = [];
    } else if (receipt) {
      this.selectedReceipt = { ...receipt };
      if (this.selectedReceipt.receipt_date) {
        const d = new Date(this.selectedReceipt.receipt_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        this.selectedReceipt.receipt_date = `${yyyy}-${mm}-${dd}`;
      }
      this.selectedReceipt.payments = receipt.payments || [];
      this.appliedInvoices = receipt.salesinvoice ? [...receipt.salesinvoice] : [];
      this.onCustomerChange(receipt.customer_id);
    }

    this.formSubmitted = false; // reset validation
  }

  addPayment() {
    if (!this.selectedReceipt.payments) this.selectedReceipt.payments = [];
    this.selectedReceipt.payments.push({
      method: '',
      reference: '',
      amount: 0,
      remarks: '',
    });
  }

  // Remove payment row
  removePayment(index: number) {
    this.selectedReceipt.payments.splice(index, 1);
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onCustomerChange(customerId: any) {
    const id = typeof customerId === 'object' ? customerId.id : Number(customerId);

    if (!id) {
      this.invoices = [];
      this.appliedInvoices = [];
      return;
    }

    fetch(`http://localhost:3000/sales-invoices?customer_id=${id}`)
      .then(res => res.json())
      .then(data => {
        this.invoices = data;
        this.appliedInvoices = [];
      });
  }

  // Apply/remove invoice
  toggleInvoice(invoice: any, event: any) {
    if (event.target.checked) {
      this.appliedInvoices.push({
        sales_invoice_id: invoice.id,
        applied_amount: 0,
      });
    } else {
      this.appliedInvoices = this.appliedInvoices.filter(
        i => i.sales_invoice_id !== invoice.id
      );
    }
  }

  saveReceipt() {
    // mark form as submitted
    this.formSubmitted = true;

    // basic validation
    if (!this.selectedReceipt.customer_id || !this.selectedReceipt.branch_id ||
        !this.selectedReceipt.receipt_number || !this.selectedReceipt.receipt_date ||
        !this.selectedReceipt.amount) {
      return; // stop submission if required fields are empty
    }

    // build payload
    const payload: any = {
      customer_id: Number(this.selectedReceipt.customer_id),
      branch_id: Number(this.selectedReceipt.branch_id),
      receipt_number: this.selectedReceipt.receipt_number,
      receipt_date: this.selectedReceipt.receipt_date, // already ISO string from <input type="date">
      amount: Number(this.selectedReceipt.amount),
      note: this.selectedReceipt.note || '',
    };

    // only include salesinvoice if any applied invoices exist
    if (this.appliedInvoices.length > 0) {
      payload.salesinvoice = this.appliedInvoices.map(inv => ({
        sales_invoice_id: inv.sales_invoice_id,
        applied_amount: Number(inv.applied_amount)
      }));
    }

    const url = this.selectedReceipt.id
      ? `http://localhost:3000/official-receipts/${this.selectedReceipt.id}`
      : 'http://localhost:3000/official-receipts';

    const method = this.selectedReceipt.id ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(() => this.loadReceipts());

    this.closeModal();
  }


  // Helpers
  getCustomerName(id: number) {
    return this.customers.find(c => c.id === id)?.customer_name || '';
  }

  getBranchName(id: number) {
    return this.branches.find(b => b.id === id)?.branch_name || '';
  }

  getAppliedInvoice(invId: number) {
    return this.appliedInvoices.find(i => i.sales_invoice_id === invId);
  }

  deleteReceipt(id: number) {
    fetch(`http://localhost:3000/official-receipts/${id}`, { method: 'DELETE' })
      .then(() => this.loadReceipts());
  }

  isApplied(invId: number): boolean {
    return !!this.appliedInvoices.find(i => i.sales_invoice_id === invId);
  }

  toggleInvoiceSelection(inv: any) {
    const existing = this.appliedInvoices.find(i => i.sales_invoice_id === inv.id);
    if (existing) {
      this.appliedInvoices = this.appliedInvoices.filter(i => i.sales_invoice_id !== inv.id);
    } else {
      this.appliedInvoices.push({ sales_invoice_id: inv.id, applied_amount: 0 });
    }
  }

  updateAppliedAmount(invId: number, amount: number) {
    const invoice = this.appliedInvoices.find(i => i.sales_invoice_id === invId);
    if (invoice) {
      invoice.applied_amount = amount;
    }
  }


  @HostListener('window:keydown', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.isModalOpen && event.key === 'Escape') {
      this.closeModal();
    }
  }
}
