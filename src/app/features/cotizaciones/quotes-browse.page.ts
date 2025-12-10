import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesToolbarComponent } from './ui/quotes-toolbar.component';
import { QuotesTableComponent } from './ui/quotes-table.component';
import { QuotesCardsComponent } from './ui/quotes-cards.component';
import { CotizacionesStore } from './data/quotes.store';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

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

    <!-- Título + acciones -->
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-semibold">Cotizaciones</h1>
        <p class="muted">Resumen general de cotizaciones y aprobaciones</p>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn btn-primary" (click)="goCreate()">
          + Nueva Cotización
        </button>

        <quotes-toolbar />
      </div>
    </div>

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
  router = inject(Router);

  ngOnInit() {
  const role = this.auth.role();
  const user = this.auth.user();

  if (role === 'DIRECTOR' && user) {
    // SOLO sus cotizaciones
    this.store.loadGlobal({ directorId: user.id });
  } else {
    // Todas las cotizaciones
    this.store.loadGlobal({});
  }
}

  goCreate() {
    this.router.navigate(['gerente/cotizaciones/crear']);
  }
}
