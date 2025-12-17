import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionesStore } from '../data/quotes.store';
import { AuthService } from '../../../core/auth/auth.service';
import { UiSelectComponent, UiSelectItem } from '../../../shared/ui/ui-select/ui-select.component';

@Component({
  selector: 'quotes-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="flex items-center gap-3">
    


    <!-- NO ADMIN: Tabs (Biblioteca / Mis Cotizaciones) -->
    <div *ngIf="auth.role() !== 'ADMIN'" class="flex p-1 bg-zinc-100 rounded-xl">
      <button 
        class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
        [class.bg-white]="!store.filters().mineOnly"
        [class.shadow-sm]="!store.filters().mineOnly"
        [class.text-zinc-900]="!store.filters().mineOnly"
        [class.text-zinc-500]="store.filters().mineOnly"
        (click)="store.setFilters({ mineOnly: false })">
        Biblioteca
      </button>
      <button 
        class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
        [class.bg-white]="store.filters().mineOnly"
        [class.shadow-sm]="store.filters().mineOnly"
        [class.text-zinc-900]="store.filters().mineOnly"
        [class.text-zinc-500]="!store.filters().mineOnly"
        (click)="store.setFilters({ mineOnly: true })">
        Mis Cotizaciones
      </button>
    </div>

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


}
