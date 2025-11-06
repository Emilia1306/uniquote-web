import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { QuotesStore } from '../data/quotes.store';

@Component({
  selector: 'quotes-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <article *ngFor="let q of store.filtered()" class="card card-hover p-6">
      <!-- encabezado -->
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-xl font-semibold leading-tight">Título cotización</h3>

        <span class="pill"
              [ngClass]="{
                'pill--ok': q.estado==='APROBADA',
                'border-yellow-300 bg-yellow-50 text-yellow-700': q.estado==='PENDIENTE',
                'border-red-300 bg-red-50 text-red-700': q.estado==='RECHAZADA'
              }">
          {{ q.estado | titlecase }}
        </span>
      </div>

      <p class="muted mt-1">Descripción de la cotización</p>

      <!-- datos -->
      <div class="mt-4 grid grid-cols-2 gap-x-4 text-sm">
        <div class="muted">Cliente:</div><div class="text-right">Pizza Hut</div>
        <div class="muted">Fecha:</div><div class="text-right">{{ q.fecha | date:'dd/MM/yy' }}</div>
        <div class="muted">Tipo de estudio:</div><div class="text-right">Casa × Casa</div>
        <div class="muted">Muestra:</div><div class="text-right">500</div>
      </div>

      <div class="divider"></div>

      <!-- monto -->
      <div>
        <div class="text-2xl font-bold text-blue-700">
          {{ q.monto | currency:'USD':'symbol':'1.0-0' }}
        </div>
        <div class="muted -mt-1 text-xs">Monto total</div>
      </div>

      <!-- botón -->
      <div class="mt-4">
        <button class="btn w-full justify-center gap-2">
          <svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor"
            d="M3 12s4-7 9-7 9 7 9 7-4 7-9 7-9-7-9-7zm9 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
          Ver Detalles
        </button>
      </div>
    </article>
  </div>
  `
})
export class QuotesCardsComponent {
  store = inject(QuotesStore);
}
