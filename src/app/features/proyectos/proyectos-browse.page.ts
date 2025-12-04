import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProyectosStore } from './data/proyectos.store';
import { ProyectosTableComponent } from './ui/proyectos-table.component';
import { ProyectosCardsComponent } from './ui/proyectos-cards.component';

@Component({
  selector: 'proyectos-browse',
  standalone: true,
  imports: [
    CommonModule,
    ProyectosTableComponent,
    ProyectosCardsComponent,
  ],
  template: `
  <div class="max-w-[1400px] mx-auto px-6 py-6">

    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold">Proyectos</h1>
        <p class="muted">Listado de proyectos del cliente</p>
      </div>

      <!-- ACCIONES (Crear + Vista) -->
      <div class="flex items-center gap-3">
        
        <!-- Botón Crear -->
        <button class="btn btn-primary"
                (click)="goCrearProyecto()">
          + Nuevo Proyecto
        </button>

        <!-- Selector Vista -->
        <div class="flex gap-2">
          <button class="btn-icon"
                  [class.opacity-60]="view()!=='cards'"
                  (click)="view.set('cards')">
            <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor"
                d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
          </button>

          <button class="btn-icon"
                  [class.opacity-60]="view()!=='table'"
                  (click)="view.set('table')">
            <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor"
                d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <ng-container [ngSwitch]="view()">
      <proyectos-cards *ngSwitchCase="'cards'"/>
      <proyectos-table *ngSwitchCase="'table'"/>
    </ng-container>

  </div>
  `
})
export class ProyectosBrowsePage {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  store = inject(ProyectosStore);
  view = signal<'table'|'cards'>('table');

  async ngOnInit() {
    const clienteId = Number(this.route.snapshot.paramMap.get('clienteId'));
    if (clienteId) {
      await this.store.loadByCliente(clienteId);
    }
  }

  goCrearProyecto() {
    this.router.navigate(['gerente/proyectos/crear']);
  }
}
