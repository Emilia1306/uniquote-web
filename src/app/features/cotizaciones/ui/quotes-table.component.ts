import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CotizacionesStore } from '../data/quotes.store';
import { STATUS_COLORS } from './status-colors';

@Component({
  selector: 'quotes-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
  <div class="card card-hover p-4 overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-zinc-500">
          <th class="px-4 py-2 font-medium">Código</th>
          <th class="px-4 py-2 font-medium">Título</th>
          <th class="px-4 py-2 font-medium">Cliente</th>
          <th class="px-4 py-2 font-medium">Proyecto</th>
          <th class="px-4 py-2 font-medium">Contacto</th>
          <th class="px-4 py-2 font-medium">Estado</th>
          <th class="px-4 py-2 font-medium">Monto</th>
          <th class="px-4 py-2 font-medium">Fecha</th>
          <th class="px-4 py-2 font-medium">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-zinc-200">

        <tr *ngFor="let q of store.filtered()" class="hover:bg-zinc-50">

          <td class="px-4 py-2">{{ q.code }}</td>

          <td class="px-4 py-2">{{ q.name }}</td>

          <td class="px-4 py-2">
            {{ q.project?.cliente?.empresa || 'N/A' }}
          </td>

          <td class="px-4 py-2">
            {{ q.project?.name || 'N/A' }}
          </td>

          <td class="px-4 py-2">
            {{ q.contacto?.nombre || 'N/A' }}
          </td>

          <td class="px-4 py-2">
            <span class="px-3 py-1 rounded-full text-xs font-medium inline-block"
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

          <td class="px-4 py-2">
            <button 
              class="h-8 px-3 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center gap-1 text-xs font-medium"
              (click)="verDetalles(q.id)">
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              Ver Detalles
            </button>
          </td>

        </tr>

      </tbody>
    </table>
  </div>
  `
})
export class QuotesTableComponent {
  store = inject(CotizacionesStore);
  router = inject(Router);
  STATUS_COLORS = STATUS_COLORS;

  verDetalles(id: number) {
    this.router.navigate(['/gerente/cotizaciones', id]);
  }
}
