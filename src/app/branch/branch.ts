import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface BranchModel {
  id?: number;
  branch_name: string;
}

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './branch.html',
  styleUrls: ['./branch.css'],
})
export class Branch {
  search = '';
  page = 1;
  pageSize = 5;

  branches: BranchModel[] = [];
  modalOpen = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedBranch: BranchModel = { branch_name: '' };

  constructor(private http: HttpClient) {
    this.loadBranches();
  }

  loadBranches() {
    this.http.get<BranchModel[]>('http://localhost:3000/branches')
      .subscribe(data => this.branches = data);
  }

  get filtered() {
    const q = this.search.trim().toLowerCase();
    return this.branches.filter(b =>
      b.branch_name.toLowerCase().includes(q)
    );
  }

  get paginated() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filtered.length / this.pageSize) || 1;
  }

  openModal(mode: 'add' | 'edit' | 'view', branch?: BranchModel) {
    this.modalMode = mode;
    this.modalOpen = true;
    this.selectedBranch = branch ? { ...branch } : { branch_name: '' };
  }

  closeModal() {
    this.modalOpen = false;
  }

  saveBranch() {
    if (this.modalMode === 'add') {
      this.http.post<BranchModel>('http://localhost:3000/branches', this.selectedBranch)
        .subscribe(() => this.loadBranches());
    } else if (this.modalMode === 'edit' && this.selectedBranch.id) {
      this.http.put<BranchModel>(`http://localhost:3000/branches/${this.selectedBranch.id}`, this.selectedBranch)
        .subscribe(() => this.loadBranches());
    }
    this.closeModal();
  }

  deleteBranch(branch: BranchModel) {
    if (!branch.id) return;
    this.http.delete(`http://localhost:3000/branches/${branch.id}`)
      .subscribe(() => this.loadBranches());
  }
}
