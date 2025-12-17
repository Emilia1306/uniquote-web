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
import Swal from 'sweetalert2';

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

          <!-- New Quote Button (Non-Admin) -->
          <button *ngIf="auth.role() !== 'ADMIN'"
            class="flex-1 md:flex-none h-12 px-6 rounded-xl bg-[var(--brand)] text-white font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            (click)="goCreate()">
            <span>+ Nueva Cotización</span>
          </button>

          <!-- Status Filter (Admin Only - Replaces Button) -->
          <div *ngIf="auth.role() === 'ADMIN'" class="w-56">
             <ui-select 
                [items]="statusItems" 
                [value]="store.filters().status ?? null" 
                (valueChange)="setFilter($event)"
                placeholder="Todos los estados">
              </ui-select>
          </div>
        </div>

      </div>
    </div>

    <!-- FILTERS ROW (Visible only for My Quotes tab if NOT Admin) -->
    <div *ngIf="store.filters().mineOnly && auth.role() !== 'ADMIN'" class="mb-6 flex justify-end animate-dropdown">
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


    <!-- SKELETON LOADER -->
    <div *ngIf="store.loading()" class="animate-pulse">
      <!-- Card Skeleton -->
      <div *ngIf="store.viewMode() === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3,4,5,6]" class="rounded-3xl bg-white p-6 shadow-sm border border-zinc-100 flex flex-col h-[320px]">
           <div class="flex justify-between items-start mb-4">
              <div class="space-y-2 w-2/3">
                 <div class="h-5 bg-zinc-200 rounded w-1/2"></div>
                 <div class="h-3 bg-zinc-100 rounded w-3/4"></div>
              </div>
              <div class="h-6 w-20 bg-zinc-100 rounded-full"></div>
           </div>
           <div class="space-y-3 mb-6">
              <div class="h-3 bg-zinc-100 rounded w-1/2"></div>
              <div class="h-3 bg-zinc-100 rounded w-1/2"></div>
           </div>
           
           <div class="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
              <div class="h-8 w-24 bg-zinc-200 rounded-lg"></div>
              <div class="h-6 w-6 bg-zinc-100 rounded-full"></div>
           </div>
        </div>
      </div>

      <!-- Table Skeleton -->
      <div *ngIf="store.viewMode() === 'table'" class="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
         <div class="w-full">
            <div class="bg-zinc-50/50 border-b border-zinc-100 h-10 w-full mb-2"></div>
            <div class="space-y-1">
               <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="flex items-center border-b border-zinc-50 p-4">
                  <div class="h-4 w-20 bg-zinc-200 rounded mx-4"></div>
                  <div class="h-4 w-1/3 bg-zinc-100 rounded mx-4"></div>
                  <div class="h-4 w-24 bg-zinc-100 rounded mx-4"></div>
                  <div class="h-4 w-24 bg-zinc-100 rounded mx-4"></div>
                  <div class="h-4 w-16 bg-zinc-200 rounded mx-4 ml-auto"></div>
               </div>
            </div>
         </div>
      </div>
    </div>

    <!-- CONTENT LIST -->
    <ng-container *ngIf="!store.loading()" [ngSwitch]="store.viewMode()">
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
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información del contacto',
            timer: 3000,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
          });
        }
      } else if (params['clienteId']) {
        const clientId = Number(params['clienteId']);
        this.store.setFilters({ clienteId: clientId });

        try {
          const client = await this.clientesApi.getById(clientId);
          this.pageTitle.set(`Historial de ${client.empresa}`);
          this.pageSubtitle.set(`Listado de todas las cotizaciones asociadas a ${client.razonSocial || client.empresa}`);
        } catch (err) {
          console.error('Error loading client metadata', err);
          this.pageTitle.set('Historial de Cliente');
        }
      } else {
        // Reset defaults
        this.store.setFilters({ contactoId: undefined, clienteId: undefined });
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
