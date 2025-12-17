import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionesStore } from '../data/quotes.store';
import { AuthService } from '../../../core/auth/auth.service';
import { UiSelectComponent, UiSelectItem } from '../../../shared/ui/ui-select/ui-select.component';

@Component({
  selector: 'quotes-toolbar',
  standalone: true,
  imports: [CommonModule, UiSelectComponent],
  template: `
  <div class="flex items-center gap-3">
    
    <!-- ADMIN: Filtro por Estado -->
    <div *ngIf="auth.role() === 'ADMIN'; else notAdmin" class="w-56">
      <ui-select 
        [items]="statusItems" 
        [value]="store.filters().status ?? null" 
        (valueChange)="setFilter($event)"
        placeholder="Todos los estados">
      </ui-select>
    </div>

    <!-- NO ADMIN: Toggle Mis Cotizaciones -->
    <ng-template #notAdmin>
      <button type="button"
        class="h-12 px-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-center gap-2 hover:bg-zinc-50 shadow-sm text-sm font-medium transition-colors"
        [class.border-black]="store.filters().mineOnly"
        [class.bg-zinc-50]="store.filters().mineOnly"
        (click)="toggleMine()">
        <span>Mis cotizaciones</span>
        <div class="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center"
             [class.bg-black]="store.filters().mineOnly"
             [class.border-black]="store.filters().mineOnly">
            <svg *ngIf="store.filters().mineOnly" viewBox="0 0 24 24" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
      </button>
    </ng-template>

    <div class="w-px h-8 bg-zinc-200"></div>

    <!-- View Toggle -->
    <button type="button"
    class="h-12 w-12 rounded-xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 shadow-sm text-zinc-600 transition-colors"
    (click)="store.setViewMode(store.viewMode() === 'cards' ? 'table' : 'cards')"
    [title]="store.viewMode() === 'cards' ? 'Cambiar a lista' : 'Cambiar a tarjetas'">
    <!-- Grid icon when in table mode -->
    <svg *ngIf="store.viewMode() === 'table'" viewBox="0 0 24 24" class="h-5 w-5">
      <path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
    </svg>
    <!-- List icon when in cards mode -->
    <svg *ngIf="store.viewMode() === 'cards'" viewBox="0 0 24 24" class="h-5 w-5">
      <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
    </svg>
  </button>
  </div>
  `
})
export class QuotesToolbarComponent {
  store = inject(CotizacionesStore);
  auth = inject(AuthService);

  statusItems: UiSelectItem[] = [
    { value: null, label: 'Todos' },
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'NEGOCIACION', label: 'Negociación' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'NO_APROBADO', label: 'No Aprobado' },
    { value: 'EN_PAUSA', label: 'En Pausa' },
    { value: 'REEMPLAZADA', label: 'Reemplazada' },
  ];

  setFilter(val: any) {
    this.store.setFilters({ status: val });
  }

  toggleMine() {
    const current = this.store.filters().mineOnly;
    this.store.setFilters({ mineOnly: !current });
  }
}
