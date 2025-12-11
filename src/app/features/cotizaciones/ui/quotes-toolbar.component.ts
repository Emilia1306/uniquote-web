import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionesStore } from '../data/quotes.store';

@Component({
  selector: 'quotes-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
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
  `
})
export class QuotesToolbarComponent {
  store = inject(CotizacionesStore);
}
