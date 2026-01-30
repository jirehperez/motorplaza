import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin').then(m => m.Admin),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'sales-invoice',
        loadComponent: () =>
          import('./sales-invoice/sales-invoice').then(m => m.SalesInvoice),
      },
      {
        path: 'official-receipt',
        loadComponent: () =>
          import('./official-receipt/official-receipt').then(m => m.OfficialReceipt),
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('./customer/customer').then(m => m.Customer),
      },
      {
        path: 'branch',
        loadComponent: () =>
          import('./branch/branch').then(m => m.Branch),
      },
      {
        path: 'vehicle',
        loadComponent: () =>
          import('./vehicle/vehicle').then(m => m.VehicleComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'admin' },
];
