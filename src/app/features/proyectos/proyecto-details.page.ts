import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProyectosApi } from './data/proyectos.api';
import { QuotesCardsComponent } from '../cotizaciones/ui/quotes-cards.component';
import { QuotesTableComponent } from '../cotizaciones/ui/quotes-table.component';
import { CotizacionesStore } from '../cotizaciones/data/quotes.store';

@Component({
  standalone: true,
  selector: 'proyecto-details',
  imports: [
    CommonModule,
    QuotesCardsComponent,
    QuotesTableComponent
  ],
  template: `
  <div class="max-w-[1400px] mx-auto px-6 py-6">
    <ng-container *ngIf="project">

      <h1 class="text-3xl font-semibold mb-2">{{ project.name }}</h1>

      <p class="muted">
        Cliente: {{ project.cliente.empresa }} ({{ project.cliente.razonSocial }})
      </p>

      <p class="muted" *ngIf="project.contacto">
        Contacto: {{ project.contacto.nombre }} · {{ project.contacto.email }}
      </p>

      <div class="divider my-6"></div>

      <button class="btn btn-primary mb-4" (click)="goCrearCotizacion()">
        + Nueva Cotización
      </button>

      <div class="flex justify-end gap-2 mb-4">
        <button 
          class="h-10 w-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 shadow-sm text-zinc-600 transition-colors"
          [class.bg-zinc-100]="view() === 'cards'"
          (click)="toggleView('cards')"
          title="Vista Tarjetas">
          <!-- Using inline SVG or lucide if available. Keeping it simple matching previous style but cleaner -->
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button 
          class="h-10 w-10 rounded-lg border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 shadow-sm text-zinc-600 transition-colors"
          [class.bg-zinc-100]="view() === 'table'"
          (click)="toggleView('table')"
          title="Vista Tabla">
           <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>

      <ng-container [ngSwitch]="view()">
        <quotes-cards *ngSwitchCase="'cards'" [quoteList]="quotes()"/>
        <quotes-table *ngSwitchCase="'table'" [quoteList]="quotes()"/>
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

  project: any = null;

  // View state with persistence
  view = signal<'cards' | 'table'>((localStorage.getItem('project-details-view-mode') as 'cards' | 'table') || 'table');

  // Expose quotes from store
  quotes = this.quotesStore.items; // or .filtered if filtering is needed later

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('projectId'));
    this.project = await firstValueFrom(this.api.getOne(id));

    // Load quotes for this project
    await this.quotesStore.loadByProject(id);
  }

  toggleView(mode: 'cards' | 'table') {
    this.view.set(mode);
    localStorage.setItem('project-details-view-mode', mode);
  }

  goCrearCotizacion() {
    this.router.navigate(['/cotizaciones/crear'], {
      queryParams: { projectId: this.project.id }
    });
  }
}
