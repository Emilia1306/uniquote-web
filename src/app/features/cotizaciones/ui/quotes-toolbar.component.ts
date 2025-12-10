import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionesStore } from '../data/quotes.store';

@Component({
  selector: 'quotes-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="flex items-center justify-end gap-2">
    <!-- Grid cards -->
    <button class="btn-icon" [class.opacity-60]="store.viewMode()!=='cards'"
            (click)="store.setView('cards')" aria-label="Ver como tarjetas">
      <!-- ícono grid -->
      <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor"
        d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
    </button>

    <!-- Lista/tabla -->
    <button class="btn-icon" [class.opacity-60]="store.viewMode()!=='table'"
            (click)="store.setView('table')" aria-label="Ver como tabla">
      <!-- ícono lista -->
      <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor"
        d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
    </button>
  </div>
  `
})
export class QuotesToolbarComponent {
  store = inject(CotizacionesStore);
}
