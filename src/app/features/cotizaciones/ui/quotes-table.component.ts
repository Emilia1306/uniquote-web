import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { QuotesStore } from '../data/quotes.store';

@Component({
  selector: 'quotes-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
  <div class="card card-hover p-4 overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-zinc-500">
          <th class="px-4 py-2 font-medium">ID</th>
          <th class="px-4 py-2 font-medium">Título</th>
          <th class="px-4 py-2 font-medium">Cliente</th>
          <th class="px-4 py-2 font-medium">Estado</th>
          <th class="px-4 py-2 font-medium">Monto</th>
          <th class="px-4 py-2 font-medium">Fecha</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-zinc-200">
        <tr *ngFor="let q of store.filtered()" class="hover:bg-zinc-50">
          <td class="px-4 py-2">{{ q.id }}</td>
          <td class="px-4 py-2">Título cotización</td>
          <td class="px-4 py-2">Pizza Hut</td>
          <td class="px-4 py-2">
            <span class="pill"
                  [ngClass]="{
                    'pill--ok': q.estado==='APROBADA',
                    'border-yellow-300 bg-yellow-50 text-yellow-700': q.estado==='PENDIENTE',
                    'border-red-300 bg-red-50 text-red-700': q.estado==='RECHAZADA'
                  }">{{ q.estado | titlecase }}</span>
          </td>
          <td class="px-4 py-2">{{ q.monto | currency:'USD':'symbol':'1.0-0' }}</td>
          <td class="px-4 py-2">{{ q.fecha | date:'dd/MM/yy' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class QuotesTableComponent {
  store = inject(QuotesStore);
}
