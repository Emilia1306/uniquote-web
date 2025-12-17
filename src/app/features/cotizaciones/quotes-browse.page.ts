import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuotesTableComponent } from './ui/quotes-table.component';
import { QuotesCardsComponent } from './ui/quotes-cards.component';
import { CotizacionesStore } from './data/quotes.store';
import { AuthService } from '../../core/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactosApi } from '../clientes/data/contactos.api';
import { ClientesApi } from '../clientes/data/clientes.api';

import { UiSelectComponent, UiSelectItem } from '../../shared/ui/ui-select/ui-select.component';
import { UiPaginationComponent } from '../../shared/ui/ui-pagination/ui-pagination.component';

@Component({
  standalone: true,
  selector: 'quotes-browse',
  imports: [
    CommonModule,
    QuotesTableComponent,
    QuotesCardsComponent,
    UiSelectComponent,
    UiPaginationComponent
  ],
  template: `
  <div class="page">

    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-[color:var(--brand)] mb-1">{{ pageTitle() }}</h1>
      <p class="text-zinc-500">{{ pageSubtitle() }}</p>
    </div>

    <!-- TOOLBAR -->
    <div class="flex flex-col xl:flex-row gap-4 mb-8">
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

      <!-- Controls Group -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        
        <!-- TABS (Biblioteca / Mis Cotizaciones) -->
        <div *ngIf="auth.role() !== 'ADMIN'" class="flex p-1 bg-zinc-100 rounded-xl">
          <button 
            class="flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all"
            [class.bg-white]="!store.filters().mineOnly"
            [class.shadow-sm]="!store.filters().mineOnly"
            [class.text-zinc-900]="!store.filters().mineOnly"
            [class.text-zinc-500]="store.filters().mineOnly"
            (click)="store.setFilters({ mineOnly: false })">
            Biblioteca
          </button>
          <button 
            class="flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all"
            [class.bg-white]="store.filters().mineOnly"
            [class.shadow-sm]="store.filters().mineOnly"
            [class.text-zinc-900]="store.filters().mineOnly"
            [class.text-zinc-500]="!store.filters().mineOnly"
            (click)="store.setFilters({ mineOnly: true })">
            Mis Cotizaciones
          </button>
        </div>

        <div class="hidden md:block w-px h-8 bg-zinc-200"></div>

        <!-- ACTIONS ROW -->
        <div class="flex items-center gap-3">
          <!-- View Toggle -->
          <button type="button"
            class="h-12 w-12 rounded-xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 shadow-sm text-zinc-600 transition-colors"
            (click)="store.setViewMode(store.viewMode() === 'cards' ? 'table' : 'cards')"
            [title]="store.viewMode() === 'cards' ? 'Cambiar a lista' : 'Cambiar a tarjetas'">
            <!-- Grid icon -->
            <svg *ngIf="store.viewMode() === 'table'" viewBox="0 0 24 24" class="h-5 w-5">
              <path fill="currentColor" d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
            <!-- List icon -->
            <svg *ngIf="store.viewMode() === 'cards'" viewBox="0 0 24 24" class="h-5 w-5">
              <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
            </svg>
          </button>

          <!-- New Quote Button -->
          <button
            class="flex-1 md:flex-none h-12 px-6 rounded-xl bg-[var(--brand)] text-white font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            (click)="goCreate()">
            <span>+ Nueva Cotización</span>
          </button>
        </div>

      </div>
    </div>

    <!-- FILTERS ROW (Visible only for Admin or My Quotes tab) -->
    <div *ngIf="auth.role() === 'ADMIN' || store.filters().mineOnly" class="mb-6 flex justify-end animate-dropdown">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-zinc-700">Filtrar por estado:</span>
        <div class="w-56">
          <ui-select 
            [items]="statusItems" 
            [value]="store.filters().status ?? null" 
            (valueChange)="setFilter($event)"
            placeholder="Todos los estados">
          </ui-select>
        </div>
      </div>
    </div>


    <!-- LISTA -->
    <ng-container [ngSwitch]="store.viewMode()">
      <quotes-cards *ngSwitchCase="'cards'" [quoteList]="store.paginatedItems()"/>
      <quotes-table *ngSwitchCase="'table'" [quoteList]="store.paginatedItems()"/>
    </ng-container>

    <!-- PAGINATION -->
    <ui-pagination
      [currentPage]="store.page()"
      [totalPages]="store.totalPages()"
      [totalItems]="store.filtered().length"
      [itemsPerPage]="store.pageSize()"
      (pageChange)="store.setPage($event)">
    </ui-pagination>

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

  goCreate() {
    const role = this.auth.role();
    if (!role) return;

    const prefix = role.toLowerCase();
    this.router.navigate([`/${prefix}/cotizaciones/crear`]);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.store.setFilters({ search: input.value });
  }
}
