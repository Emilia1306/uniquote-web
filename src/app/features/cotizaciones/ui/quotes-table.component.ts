import { Component, inject, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CotizacionesStore } from '../data/quotes.store';
import { STATUS_COLORS } from './status-colors';

@Component({
  selector: 'quotes-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ],
  template: `
  <div class="card card-hover p-4 overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-zinc-500">
          <th class="px-4 py-2 font-medium">Código</th>
          <th class="px-4 py-2 font-medium">Título</th>
          <th class="px-4 py-2 font-medium">Cliente</th>
          <th class="px-4 py-2 font-medium">Estado</th>
          <th class="px-4 py-2 font-medium">Monto</th>
          <th class="px-4 py-2 font-medium">Fecha</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-zinc-200">

        <tr *ngFor="let q of store.filtered()" class="hover:bg-zinc-50">

          <td class="px-4 py-2">{{ q.code }}</td>

          <td class="px-4 py-2">{{ q.name }}</td>

          <td class="px-4 py-2">
            {{ q.createdBy.name }} {{ q.createdBy.lastName }}
          </td>

          <td class="px-4 py-2">
            <<span class="pill border"
              [ngClass]="STATUS_COLORS[q.status]">
          {{ q.status | titlecase }}
        </span>

          </td>

          <td class="px-4 py-2">
            {{ q.totalCobrar | currency:'USD':'symbol':'1.0-0' }}
          </td>

          <td class="px-4 py-2">
            {{ q.createdAt | date:'dd/MM/yy' }}
          </td>

        </tr>

      </tbody>
    </table>
  </div>
  `
})
export class QuotesTableComponent {
  store = inject(CotizacionesStore);
  STATUS_COLORS = STATUS_COLORS;
  @Input() items: any[] = []; 
  
}
