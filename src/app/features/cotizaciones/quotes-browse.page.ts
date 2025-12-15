import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotesToolbarComponent } from './ui/quotes-toolbar.component';
import { QuotesTableComponent } from './ui/quotes-table.component';
import { QuotesCardsComponent } from './ui/quotes-cards.component';
import { CotizacionesStore } from './data/quotes.store';
import { AuthService } from '../../core/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactosApi } from '../clientes/data/contactos.api';
import { ClientesApi } from '../clientes/data/clientes.api';

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
  <div class="page">

    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-[color:var(--brand)] mb-1">{{ pageTitle() }}</h1>
      <p class="text-zinc-500">{{ pageSubtitle() }}</p>
    </div>

    <!-- TOOLBAR -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <!-- Buscador -->
      <div class="relative flex-1">
        <input
          class="w-full h-12 rounded-xl border border-zinc-200 bg-white px-5 pr-12 outline-none focus:border-zinc-400 focus:ring-0 shadow-sm"
          placeholder="Buscar..."
          [value]="store.filters().search"
          (input)="onSearchChange($event)" />
        <svg class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Acciones derecha -->
      <div class="flex items-center gap-3">
        <quotes-toolbar />

        <button
          class="h-12 px-6 rounded-xl bg-[var(--brand)] text-white font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm"
          (click)="goCreate()">
          <span>+ Nueva Cotización</span>
        </button>
      </div>
    </div>

    <!-- LISTA -->
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
  route = inject(ActivatedRoute);

  // APIs para metadata del header
  contactosApi = inject(ContactosApi);
  clientesApi = inject(ClientesApi);

  pageTitle = signal('Cotizaciones');
  pageSubtitle = signal('Resumen general de cotizaciones y aprobaciones');

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      if (params['contactoId']) {
        const cid = Number(params['contactoId']);
        this.store.setFilters({ contactoId: cid });

        // Cargar datos para el header
        try {
          const contact = await this.contactosApi.getById(cid);
          this.pageTitle.set(`Cotizaciones de ${contact.nombre}`);

          // Intentar obtener empresa
          if (contact.clienteId) {
            const client = await this.clientesApi.getById(contact.clienteId);
            this.pageSubtitle.set(`${client.empresa}`);
          } else {
            this.pageSubtitle.set(contact.email);
          }
        } catch (err) {
          console.error('Error cargando metadata de contacto', err);
        }

      } else {
        // Reset defaults
        this.store.setFilters({ contactoId: undefined });
        this.pageTitle.set('Cotizaciones');
        this.pageSubtitle.set('Resumen general de cotizaciones y aprobaciones');
      }
    });

    // Cargar todas las cotizaciones
    this.store.loadGlobal({});
  }

  goCreate() {
    this.router.navigate(['gerente/cotizaciones/crear']);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.store.setFilters({ search: input.value });
  }
}
