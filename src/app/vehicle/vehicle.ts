import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Vehicle {
  id?: number;
  vehicle_type: string;
  make: string;
  color: string;
  gvw: number;
  engine_number: string;
  serial_number: string;
  plate_number: string;
  cs_number: string;
  description: string;
}

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle.html'
})
export class VehicleComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  searchTerm: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;

  // Modal
  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedVehicle: Vehicle = this.emptyVehicle();

  constructor() {}

  ngOnInit() {
    this.getVehicles();
  }

  getVehicles() {
    fetch('http://localhost:3000/vehicles')
      .then(res => res.json())
      .then((data: Vehicle[]) => {
        this.vehicles = data;
        this.filteredVehicles = data;
      })
      .catch(err => console.error('Error fetching vehicles:', err));
  }

  searchVehicles() {
    this.filteredVehicles = this.vehicles.filter(v =>
      Object.values(v).some(val =>
        String(val).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
    this.currentPage = 1;
  }

  // Pagination helpers
  get paginatedVehicles() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVehicles.slice(start, start + this.itemsPerPage);
  }

  totalPages() {
    return Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
  }

  // Modal helpers
  openModal(mode: 'add' | 'edit' | 'view', vehicle?: Vehicle) {
    this.modalMode = mode;
    this.showModal = true;
    this.selectedVehicle = vehicle ? { ...vehicle } : this.emptyVehicle();
  }

  closeModal() {
    this.showModal = false;
  }

  // saveVehicle() {
  //   if (this.modalMode === 'add') {
  //     fetch('http://localhost:3000/vehicles', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(this.selectedVehicle)
  //     }).then(() => this.getVehicles());
  //   } else if (this.modalMode === 'edit' && this.selectedVehicle.id) {
  //     fetch(`http://localhost:3000/vehicles/${this.selectedVehicle.id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(this.selectedVehicle)
  //     }).then(() => this.getVehicles());
  //   }
  //   this.closeModal();
  // }

  saveVehicle() {
    // ensure gvw is a number
    if (this.selectedVehicle) {
      this.selectedVehicle.gvw = Number(this.selectedVehicle.gvw);

      if (this.selectedVehicle.id) {
        // Update existing
        fetch(`http://localhost:3000/vehicles/${this.selectedVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.selectedVehicle)
        }).then(() => this.getVehicles());
      } else {
        // Create new
        fetch('http://localhost:3000/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.selectedVehicle)
        }).then(() => this.getVehicles());
      }
      this.closeModal();
    }
  }

  deleteVehicle(id: number) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      fetch(`http://localhost:3000/vehicles/${id}`, {
        method: 'DELETE'
      }).then(() => this.getVehicles());
    }
  }

  emptyVehicle(): Vehicle {
    return {
      vehicle_type: '',
      make: '',
      color: '',
      gvw: 0,
      engine_number: '',
      serial_number: '',
      plate_number: '',
      cs_number: '',
      description: ''
    };
  }
}
