import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProyectosStore } from '../data/proyectos.store';

@Component({
  selector: 'proyectos-cards',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <article
      *ngFor="let p of store.list()"
      class="card card-hover p-6">

      <div class="flex justify-between items-start">
        <h2 class="text-xl font-semibold leading-tight">
          {{ p.name }}
        </h2>

        <span class="pill pill--blue text-sm">
          {{ p._count?.cotizaciones || 0 }} cot.
        </span>
      </div>

      <p class="muted mt-1 text-sm">
        Cliente: <b>{{ p.cliente.empresa }}</b>
      </p>

      <p class="muted text-sm">
        Contacto: {{ p.contacto?.nombre || '—' }}
      </p>

      <div class="divider"></div>

      <div class="text-right">
        <div class="text-sm text-zinc-500">Creado:</div>
        <div class="text-lg font-bold">
          {{ p.createdAt | date:'dd/MM/yy' }}
        </div>
      </div>

    </article>
  </div>
  `
})
export class ProyectosCardsComponent {
  store = inject(ProyectosStore);
}
