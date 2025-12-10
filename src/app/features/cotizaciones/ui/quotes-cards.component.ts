import { Component, inject, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CotizacionesStore } from '../data/quotes.store';
import { STATUS_COLORS } from './status-colors';

@Component({
  selector: 'quotes-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <article *ngFor="let q of store.filtered()" class="card card-hover p-6">

      <div class="flex items-start justify-between gap-2">
        <h3 class="text-xl font-semibold leading-tight">{{ q.name }}</h3>

        <span class="pill border"
              [ngClass]="STATUS_COLORS[q.status]">
          {{ q.status | titlecase }}
        </span>
      </div>

      <p class="muted mt-1">
        {{ q.createdBy.name }} {{ q.createdBy.lastName }}
      </p>

      <div class="mt-4 grid grid-cols-2 gap-x-4 text-sm">
        <div class="muted">Fecha:</div>
        <div class="text-right">{{ q.createdAt | date:'dd/MM/yy' }}</div>
        <div class="muted">Entrevistas:</div>
        <div class="text-right">{{ q.totalEntrevistas }}</div>
      </div>

      <div class="divider"></div>

      <div>
        <div class="text-2xl font-bold text-blue-700">
          {{ q.totalCobrar | currency:'USD':'symbol':'1.0-0' }}
        </div>
        <div class="muted -mt-1 text-xs">Monto total</div>
      </div>

    </article>
  </div>
  `
})
export class QuotesCardsComponent {
  @Input() items: any[] = [];   
  store = inject(CotizacionesStore);
  STATUS_COLORS = STATUS_COLORS;
  
}
