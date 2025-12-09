import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProyectosApi } from './data/proyectos.api';
import { QuotesCardsComponent } from '../cotizaciones/ui/quotes-cards.component';
import { QuotesTableComponent } from '../cotizaciones/ui/quotes-table.component';

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
        <button class="btn-icon" [class.opacity-60]="view()!=='cards'" (click)="view.set('cards')">
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor"
          d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
        </button>
        <button class="btn-icon" [class.opacity-60]="view()!=='table'" (click)="view.set('table')">
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor"
          d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
        </button>
      </div>

      <ng-container [ngSwitch]="view()">
        <quotes-cards *ngSwitchCase="'cards'" [items]="project.cotizaciones"/>
        <quotes-table *ngSwitchCase="'table'" [items]="project.cotizaciones"/>
      </ng-container>

    </ng-container>
  </div>
  `
})
export class ProyectoDetailsPage {

  private api = inject(ProyectosApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  project: any = null;
  view = signal<'cards' | 'table'>('table');

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('projectId'));
    this.project = await firstValueFrom(this.api.getOne(id));
  }

  goCrearCotizacion() {
    this.router.navigate(['/cotizaciones/crear'], {
      queryParams: { projectId: this.project.id }
    });
  }
}
