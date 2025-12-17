import { Component, inject, HostListener, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { CotizacionesStore } from '../data/quotes.store';
import { STATUS_COLORS } from './status-colors';
import { QuoteStatusModalComponent } from './quote-status-modal.component';
import { CotizacionesApi, Cotizacion } from '../data/cotizaciones.api';
import { AuthService } from '../../../core/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'quotes-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe], // CommonModule includes NgIf
  template: `
  <div class="card card-hover p-4 overflow-x-auto">
    <ng-container *ngIf="(quoteList || store.filtered()).length > 0; else emptyState">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-zinc-500">
            <th class="px-4 py-2 font-medium">Código</th>
            <th class="px-4 py-2 font-medium">Título</th>
            <th *ngIf="!hideContextColumns" class="px-4 py-2 font-medium">Cliente</th>
            <th *ngIf="!hideContextColumns" class="px-4 py-2 font-medium">Proyecto</th>
            <th class="px-4 py-2 font-medium">Contacto</th>
            <th class="px-4 py-2 font-medium">Estado</th>
            <th class="px-4 py-2 font-medium">Monto</th>
            <th class="px-4 py-2 font-medium">Fecha</th>
            <th class="px-4 py-2 font-medium">Acciones</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-zinc-200">

          <tr *ngFor="let q of (quoteList || store.filtered())" class="hover:bg-zinc-50">

            <td class="px-4 py-2">{{ q.code }}</td>

            <td class="px-4 py-2">{{ q.name }}</td>

            <td *ngIf="!hideContextColumns" class="px-4 py-2">
              {{ q.project?.cliente?.empresa || 'N/A' }}
            </td>

            <td *ngIf="!hideContextColumns" class="px-4 py-2">
              {{ q.project?.name || 'N/A' }}
            </td>

            <td class="px-4 py-2">
              {{ q.contacto?.nombre || 'N/A' }}
            </td>

            <td class="px-4 py-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium inline-block"
                [ngClass]="STATUS_COLORS[q.status]">
            {{ formatStatus(q.status) }}
          </span>

            </td>

            <td class="px-4 py-2">
              {{ q.totalCobrar | currency:'USD':'symbol':'1.2-2' }}
            </td>

            <td class="px-4 py-2">
              {{ q.createdAt | date:'dd/MM/yy' }}
            </td>


            <td class="px-4 py-2 relative">
              <button 
                class="h-8 w-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors"
                (click)="toggleDropdown(q.id, $event)">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div *ngIf="activeDropdownId === q.id" 
                   class="fixed w-48 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-[100]"
                   [style.top.px]="dropdownPos.y"
                   [style.left.px]="dropdownPos.x">
                
                <button (click)="verDetalles(q.id)" 
                  class="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 5 8.268 7.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles
                </button>

                <button *ngIf="canChangeStatus(q)" (click)="cambiarEstado(q)" 
                  class="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar estado
                </button>

                <button *ngIf="canClone(q)" (click)="clonar(q)" 
                  class="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Clonar
                </button>
              </div>
            </td>

          </tr>

        </tbody>
      </table>
    </ng-container>

    <ng-template #emptyState>
      <div class="flex flex-col items-center justify-center py-12 text-zinc-400">
        <svg class="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-sm font-medium">No hay cotizaciones para mostrar</p>
      </div>
    </ng-template>
  </div>
  `
})
export class QuotesTableComponent {
  @Input() quoteList: Cotizacion[] | null = null;
  @Input() hideContextColumns = false;
  store = inject(CotizacionesStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  dialog = inject(Dialog);
  auth = inject(AuthService);
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
    if (this.isFinalized(q.status)) return false;
    const isAdmin = this.auth.role() === 'ADMIN';
    if (isAdmin) return false; // Admin cannot edit status

    const userId = this.auth.user()?.id;
    return q.createdBy?.id === userId;
  }

  canClone(q: Cotizacion): boolean {
    if (q.status !== 'APROBADO') return false;
    const isAdmin = this.auth.role() === 'ADMIN';
    return !isAdmin; // Admin cannot clone
  }

  cambiarEstado(q: Cotizacion) {
    this.activeDropdownId = null; // close dropdown
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

  activeDropdownId: number | null = null;
  dropdownPos = { x: 0, y: 0 };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.activeDropdownId !== null) {
      this.activeDropdownId = null;
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  closeDropdown() {
    this.activeDropdownId = null;
  }

  toggleDropdown(id: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeDropdownId === id) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = id;
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();

      // Alineamos a la derecha del botón (restamos el ancho del dropdown estimado 12rem = 192px)
      // Ajustamos un poco para que se vea bien
      this.dropdownPos = {
        x: rect.right - 192,
        y: rect.bottom + 5
      };
    }
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
    this.activeDropdownId = null;
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
