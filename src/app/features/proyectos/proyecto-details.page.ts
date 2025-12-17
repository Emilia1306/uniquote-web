import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProyectosApi } from './data/proyectos.api';
import { QuotesCardsComponent } from '../cotizaciones/ui/quotes-cards.component';
import { QuotesTableComponent } from '../cotizaciones/ui/quotes-table.component';
import { CotizacionesStore } from '../cotizaciones/data/quotes.store';
import { AuthService } from '../../core/auth/auth.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  standalone: true,
  selector: 'proyecto-details',
  imports: [
    CommonModule,
    QuotesCardsComponent,
    QuotesTableComponent
  ],
  template: `
  <div class="page">
    <ng-container *ngIf="project">

      <!-- Header Section -->
      <header class="mb-8">
        
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          
          <div class="flex-1">
            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-bold text-[var(--brand)] tracking-tight mb-2">{{ project.name }}</h1>
            
            <!-- Metadata: Client • Date -->
            <div class="flex flex-wrap items-center gap-2 text-sm text-zinc-600 mb-6">
               <span class="font-medium bg-zinc-100 px-3 py-1 rounded-full">{{ project.cliente.empresa }}</span>
               <span class="text-zinc-300 hidden md:inline">•</span>
               <span class="block md:inline w-full md:w-auto text-zinc-500">Creado el {{ project.createdAt | date:'longDate' }}</span>
            </div>

            <!-- Contact Info -->
            <div class="flex flex-col md:flex-row gap-4 md:gap-8 text-sm">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div class="text-zinc-500 text-xs mb-0.5">Contacto Principal</div>
                  <div class="font-semibold text-zinc-900">{{ project.contacto?.nombre || 'Sin asignar' }}</div>
                </div>
              </div>

               <div class="flex items-center gap-3" *ngIf="project.contacto?.email">
                <div class="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                   <div class="text-zinc-500 text-xs mb-0.5">Email</div>
                   <div class="font-semibold text-zinc-900">{{ project.contacto.email }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- New Quote Button (Top Right Desktop, Bottom Header Mobile) -->
          <!-- HIDDEN FOR ADMIN -->
          <button *ngIf="auth.role() !== 'ADMIN'"
            class="btn btn-primary h-12 shadow-lg shadow-orange-200/50 px-6 shrink-0 w-full md:w-auto order-last md:order-none mt-4 md:mt-0 rounded-2xl" 
            (click)="goCrearCotizacion()">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cotización
          </button>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap gap-4 md:gap-6 mb-8 md:mb-10">
        <!-- Card 1: Total Quotes -->
        <div class="card p-5 flex items-center gap-5 w-full md:w-auto md:min-w-[240px] !rounded-3xl border-0 shadow-lg shadow-orange-500/5">
           <div class="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
             <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
           </div>
           <div>
             <div class="text-3xl font-bold text-zinc-900 tracking-tight">{{ quotes()?.length || 0 }}</div>
             <div class="text-sm text-zinc-500 font-medium">Cotizaciones Totales</div>
           </div>
        </div>

        <!-- Card 2: Total Amount -->
        <div class="card p-5 flex items-center gap-5 w-full md:w-auto md:min-w-[280px] !rounded-3xl border-0 shadow-lg shadow-green-500/5">
           <div class="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
             <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
           <div>
             <div class="text-3xl font-bold text-zinc-900 tracking-tight">{{ totalAmount() | currency:'USD':'symbol':'1.0-0' }}</div>
             <div class="text-sm text-zinc-500 font-medium">Monto Total Estimado</div>
           </div>
        </div>
      </div>

      <!-- Toolbar: Search + Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        <!-- Search Bar -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Buscar..." 
            class="input pl-10 h-11 w-full rounded-xl bg-white border-zinc-200 focus:border-zinc-300 shadow-sm"
            (input)="onSearch($event)">
        </div>

         <div class="flex items-center gap-3">
           <!-- My Quotes Toggle (Visual) -->
           <!-- HIDDEN FOR ADMIN -->
          <div *ngIf="auth.role() !== 'ADMIN'"
               (click)="toggleMyQuotes()"
               [class.bg-[var(--brand)]]="showOnlyMyQuotes()"
               [class.border-[var(--brand)]]="showOnlyMyQuotes()"
               class="flex items-center bg-white border border-zinc-200 rounded-xl px-4 h-11 cursor-pointer hover:bg-zinc-50 transition-colors shadow-sm">
            <span class="text-sm font-medium mr-2"
                  [class.text-white]="showOnlyMyQuotes()"
                  [class.text-zinc-700]="!showOnlyMyQuotes()">Mis cotizaciones</span>
            <div class="w-4 h-4 rounded-full border flex items-center justify-center"
                 [class.border-white]="showOnlyMyQuotes()"
                 [class.bg-white]="showOnlyMyQuotes()"
                 [class.border-zinc-300]="!showOnlyMyQuotes()">
              <svg *ngIf="showOnlyMyQuotes()" class="w-3 h-3 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <!-- View Toggle (Single Button) -->
          <button 
            class="h-11 w-11 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors shadow-sm"
            (click)="toggleViewMode()"
            [title]="view() === 'cards' ? 'Ver como lista' : 'Ver como tarjetas'">
            
            <!-- Show List icon when in Cards mode (to switch to list) -->
            <svg *ngIf="view() === 'cards'" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>

            <!-- Show Cards icon when in Table mode (to switch to cards) -->
            <svg *ngIf="view() === 'table'" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>
      </div>

      <ng-container [ngSwitch]="view()">
        <quotes-cards 
          *ngSwitchCase="'cards'" 
          [quoteList]="quotes()"
          [hideContextColumns]="true"
        />
        <quotes-table 
          *ngSwitchCase="'table'" 
          [quoteList]="quotes()" 
          [hideContextColumns]="true"
        />
      </ng-container>

    </ng-container>
  </div>
  `
})
export class ProyectoDetailsPage {

  private api = inject(ProyectosApi);
  private quotesStore = inject(CotizacionesStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  auth = inject(AuthService);

  project: any = null;

  // View state with persistence
  view = signal<'cards' | 'table'>((localStorage.getItem('project-details-view-mode') as 'cards' | 'table') || 'table');

  // Filter for "Mis cotizaciones"
  showOnlyMyQuotes = signal<boolean>(false);

  // Expose quotes from store with optional filtering
  quotes = computed(() => {
    const allQuotes = this.quotesStore.items();

    // If "Mis cotizaciones" is not active, show all quotes for this project
    if (!this.showOnlyMyQuotes()) {
      return allQuotes;
    }

    // Filter to show only quotes created by the logged-in user
    const userId = this.auth.user()?.id;
    return allQuotes.filter(q => q.createdBy?.id === userId);
  });

  totalAmount = computed(() => {
    const qs = this.quotes();
    if (!qs || qs.length === 0) return 0;

    // Check if there are ANY 'APROBADO' quotes
    const hasApproved = qs.some(q => q.status === 'APROBADO');

    if (hasApproved) {
      // If there are approved quotes, ONLY sum the approved ones
      return qs
        .filter(q => q.status === 'APROBADO')
        .reduce((acc, q) => acc + (q.totalCobrar || 0), 0);
    } else {
      // If NONE are approved, sum everything EXCEPT 'NO_APROBADO' and 'REEMPLAZADA'
      // (e.g., ENVIADO, NEGOCIACION, EN_PAUSA)
      return qs
        .filter(q => q.status !== 'NO_APROBADO' && q.status !== 'REEMPLAZADA')
        .reduce((acc, q) => acc + (q.totalCobrar || 0), 0);
    }
  });

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('projectId'));

    try {
      this.project = await firstValueFrom(this.api.getOne(id));
      // Load quotes for this project
      await this.quotesStore.loadByProject(id);
    } catch (e: any) {
      console.error('Error loading project details', e);
      await Swal.fire({
        icon: 'error',
        title: 'Proyecto no encontrado',
        text: 'No se pudo cargar la información del proyecto.',
        confirmButtonColor: 'var(--brand)'
      });
      // Go back safely
      if (window.history.length > 1) {
        this.location.back();
      } else {
        // Fallback if opened directly
        this.router.navigate(['/']);
      }
    }
  }

  toggleView(mode: 'cards' | 'table') {
    this.view.set(mode);
    localStorage.setItem('project-details-view-mode', mode);
  }

  toggleViewMode() {
    this.view.update(v => v === 'cards' ? 'table' : 'cards');
    localStorage.setItem('project-details-view-mode', this.view());
  }

  toggleMyQuotes() {
    this.showOnlyMyQuotes.update(v => !v);
  }

  goCrearCotizacion() {
    const role = this.auth.role()?.toLowerCase();
    this.router.navigate([`/${role}/cotizaciones/crear`], {
      queryParams: { projectId: this.project.id }
    });
  }

  goBack() {
    this.location.back();
  }

  onSearch(event: any) {
    const value = event.target.value;
    // TODO: Implement search in store or local filter
    // this.quotesStore.setSearch(value); // If this exists
  }
}
