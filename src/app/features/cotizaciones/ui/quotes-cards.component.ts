import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CotizacionesStore } from '../data/quotes.store';
import { STATUS_COLORS } from './status-colors';

@Component({
  selector: 'quotes-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <article *ngFor="let q of store.filtered()" class="card card-hover p-6">

      <!-- Header: Título + Estado -->
      <div class="flex items-start justify-between gap-2 mb-4">
        <h3 class="text-xl font-semibold leading-tight">{{ q.name }}</h3>
        <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="STATUS_COLORS[q.status]">
          {{ q.status | titlecase }}
        </span>
      </div>

      <!-- Información detallada -->
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-zinc-500">Cliente:</span>
          <span class="font-medium">{{ q.project?.cliente?.empresa || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-zinc-500">Fecha:</span>
          <span>{{ q.createdAt | date:'dd/MM/yy' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-zinc-500">Tipo de estudio:</span>
          <span>{{ q.metodologia || q.studyType || 'N/A'}}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-zinc-500">Proyecto:</span>
          <span class="font-medium">{{ q.project?.name || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-zinc-500">Creador:</span>
          <span>{{ q.createdBy.name }} {{ q.createdBy.lastName }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-zinc-500">Contacto:</span>
          <span>{{ q.contacto?.nombre || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-zinc-500">Muestra:</span>
          <span class="font-medium">{{ q.totalEntrevistas }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Monto total -->
      <div class="mb-4">
        <div class="text-2xl font-bold text-[var(--brand)]">
          {{ q.totalCobrar | currency:'USD':'symbol':'1.0-0' }}
        </div>
        <div class="text-xs text-zinc-500">Monto total</div>
      </div>

      <!-- Botón Ver Detalles -->
      <button 
        class="w-full h-10 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        (click)="verDetalles(q.id)">
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
        </svg>
        Ver Detalles
      </button>

    </article>
  </div>
  `
})
export class QuotesCardsComponent {
  store = inject(CotizacionesStore);
  router = inject(Router);
  STATUS_COLORS = STATUS_COLORS;

  verDetalles(id: number) {
    this.router.navigate(['/gerente/cotizaciones', id]);
  }
}
