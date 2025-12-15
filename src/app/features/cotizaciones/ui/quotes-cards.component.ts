import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
          {{ q.totalCobrar | currency:'USD':'symbol':'1.2-2' }}
        </div>
        <div class="text-xs text-zinc-500">Monto total</div>
      </div>

      <div class="flex gap-2">
        <button 
          class="flex-1 h-10 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          (click)="verDetalles(q.id)">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
          </svg>
          Ver Detalles
        </button>

        <button 
          class="h-10 w-10 shrink-0 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center text-zinc-600"
          (click)="editar(q.id)"
          title="Editar">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button 
          class="h-10 w-10 shrink-0 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center text-zinc-600"
          (click)="clonar(q.id)"
          title="Clonar">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </button>
      </div>

    </article>
  </div>
  `
})

export class QuotesCardsComponent {
  store = inject(CotizacionesStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  STATUS_COLORS = STATUS_COLORS;

  verDetalles(id: number) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  editar(id: number) {
    this.router.navigate(['editar', id], { relativeTo: this.route });
  }

  async clonar(id: number) {
    if (!confirm('¿Seguro que deseas clonar esta cotización?')) return;

    try {
      const res = await this.store.cloneQuote(id);
      if (res?.id) {
        this.router.navigate(['editar', res.id], { relativeTo: this.route });
      }
    } catch (err) {
      console.error('Error al clonar', err);
    }
  }
}
