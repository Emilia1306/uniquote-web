import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesToolbarComponent } from './ui/quotes-toolbar.component';
import { QuotesTableComponent } from './ui/quotes-table.component';
import { QuotesCardsComponent } from './ui/quotes-cards.component';
import { CotizacionesStore } from './data/quotes.store';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'quotes-browse',
  imports: [
    CommonModule,
    QuotesToolbarComponent,
    QuotesTableComponent,
    QuotesCardsComponent
  ],
  template: `
  <div class="mx-auto max-w-[1400px] px-6 py-6">

    <!-- Título + Toolbar -->
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-semibold">Cotizaciones</h1>
        <p class="muted">Resumen general de cotizaciones y aprobaciones</p>
      </div>
      <quotes-toolbar />
    </div>

    <!-- Listado -->
    <ng-container [ngSwitch]="store.viewMode()">
      <quotes-cards *ngSwitchCase="'cards'"/>
      <quotes-table *ngSwitchCase="'table'"/>
    </ng-container>

  </div>
  `
})
export class QuotesBrowsePage {
  
  store = inject(CotizacionesStore);
  auth = inject(AuthService);

  ngOnInit() {

    // Determinar alcance según rol
    const scope = this.auth.role() === 'DIRECTOR' ? 'mine' : 'global';
    const userId = this.auth.user() ? String(this.auth.user()!.id) : undefined;

    // ✔ Método REAL del store
    this.store.loadGlobal({ scope, userId });
  }
}
