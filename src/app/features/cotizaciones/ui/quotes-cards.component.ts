import { Component, inject, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { CotizacionesStore } from '../data/quotes.store';
import { AuthService } from '../../../core/auth/auth.service';
import { STATUS_COLORS } from './status-colors';
import { QuoteStatusModalComponent } from './quote-status-modal.component';
import { CotizacionesApi, Cotizacion } from '../data/cotizaciones.api';
import Swal from 'sweetalert2';

@Component({
  selector: 'quotes-cards',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
  <ng-container *ngIf="(quoteList || store.filtered()).length > 0; else emptyState">
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article *ngFor="let q of (quoteList || store.filtered())" class="card card-hover p-6 flex flex-col h-full">

        <!-- Header: Título + Estado -->
        <div class="flex items-start justify-between gap-2 mb-4">
          <h3 class="text-xl font-semibold leading-tight break-words">{{ q.name }}</h3>
          <span class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0" [ngClass]="STATUS_COLORS[q.status]">
            {{ formatStatus(q.status) }}
          </span>
        </div>

        <!-- Información detallada -->
        <div class="space-y-2 text-sm flex-1">
          <div class="flex justify-between" *ngIf="!hideContextColumns">
            <span class="text-zinc-500">Cliente:</span>
            <span class="font-medium text-right">{{ q.project?.cliente?.empresa || 'N/A' }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-zinc-500">Fecha:</span>
            <span>{{ q.createdAt | date:'dd/MM/yy' }}</span>
          </div>
          
          <div class="flex justify-between" *ngIf="q.metodologia || q.studyType">
            <span class="text-zinc-500">Tipo de estudio:</span>
            <span class="text-right">{{ q.metodologia || q.studyType }}</span>
          </div>
          
          <div class="flex justify-between" *ngIf="!hideContextColumns">
            <span class="text-zinc-500">Proyecto:</span>
            <span class="font-medium text-right">{{ q.project?.name || 'N/A' }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-zinc-500">Creador:</span>
            <span class="text-right">
              {{ (q.createdBy && q.createdBy.name) ? (q.createdBy.name + ' ' + q.createdBy.lastName) : (auth.user()?.name + ' ' + auth.user()?.lastName) }}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-zinc-500">Contacto:</span>
            <span class="text-right">{{ q.contacto?.nombre || 'N/A' }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-zinc-500">Muestra:</span>
            <span class="font-medium">{{ q.totalEntrevistas }}</span>
          </div>
        </div>

        <div class="divider mt-4 mb-4"></div>

        <!-- Monto total -->
        <div class="mb-4">
          <div class="text-2xl font-bold text-[var(--brand)]">
            {{ q.totalCobrar | currency:'USD':'symbol':'1.2-2' }}
          </div>
          <div class="text-xs text-zinc-500">Monto total</div>
        </div>

        <div class="flex gap-2">
          <!-- Detalles -->
          <button 
            class="flex-1 h-10 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            (click)="verDetalles(q.id)">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
            </svg>
            Ver Detalles
          </button>

          <!-- Editar Estado (Solo si NO es final) -->
          <button *ngIf="canChangeStatus(q)"
            class="h-10 w-10 shrink-0 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center text-zinc-600"
            (click)="cambiarEstado(q)"
            title="Cambiar Estado">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <!-- Clonar (Solo aprobadas, NO admin) -->
          <button 
            *ngIf="canClone(q)"
            (click)="clonar(q)"
            class="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Clonar cotización">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

      </article>
    </div>
  </ng-container>

  <ng-template #emptyState>
    <div class="flex flex-col items-center justify-center py-12 text-zinc-400">
      <svg class="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="text-sm font-medium">No hay cotizaciones para mostrar</p>
    </div>
  </ng-template>
  `
})
export class QuotesCardsComponent {
  @Input() quoteList: Cotizacion[] | null = null;
  @Input() hideContextColumns = false; // Add input
  store = inject(CotizacionesStore);
  auth = inject(AuthService);
  router = inject(Router);
  dialog = inject(Dialog);
  route = inject(ActivatedRoute);

  STATUS_COLORS = STATUS_COLORS;

  formatStatus(status: string): string {
    if (!status) return '';
    const text = status.replace(/_/g, ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  isFinalized(status: string): boolean {
    return ['APROBADO', 'NO_APROBADO', 'REEMPLAZADA'].includes(status);
  }

  canChangeStatus(q: Cotizacion): boolean {
    // Admin cannot change status
    const isAdmin = this.auth.role() === 'ADMIN';
    if (isAdmin) return false;

    // Cannot change if finalized (NO_APROBADO, APROBADO, REEMPLAZADA)
    if (this.isFinalized(q.status)) return false;

    // GERENTE and DIRECTOR can change status of non-finalized quotes
    // Note: API doesn't populate createdBy, so we allow editing for all non-finalized quotes
    // The backend should handle ownership validation
    return true;
  }

  canClone(q: Cotizacion): boolean {
    if (q.status !== 'APROBADO') return false;
    const isAdmin = this.auth.role() === 'ADMIN';
    return !isAdmin; // Admin cannot clone
  }

  cambiarEstado(q: Cotizacion) {
    this.dialog.open(QuoteStatusModalComponent, {
      data: {
        id: q.id,
        code: q.code,
        currentStatus: q.status
      },
      width: '400px',
      disableClose: false,
      backdropClass: 'blur-backdrop'
    });
  }

  verDetalles(id: number) {
    const role = this.auth.role();
    if (!role) return;
    const prefix = role.toLowerCase();
    this.router.navigate([`/${prefix}/cotizaciones`, id]);
  }

  editar(id: number) {
    this.router.navigate(['editar', id], { relativeTo: this.route });
  }

  async clonar(q: Cotizacion) {
    if (q.status !== 'APROBADO') {
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: 'Solo se pueden clonar cotizaciones aprobadas',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const res = await Swal.fire({
      title: '¿Clonar cotización?',
      text: `Se creará una copia de "${q.name}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, clonar',
      cancelButtonText: 'Cancelar'
    });

    if (!res.isConfirmed) return;

    try {
      const newQuote = await this.store.cloneQuote(q.id);
      if (newQuote?.id) {
        Swal.fire({
          icon: 'success',
          title: 'Clonada',
          text: 'Redirigiendo a edición...',
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          this.router.navigate(['editar', newQuote.id], { relativeTo: this.route });
        }, 1500);
      }
    } catch (err) {
      console.error('Error al clonar', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo clonar la cotización',
        confirmButtonColor: 'var(--brand)'
      });
    }
  }
}
