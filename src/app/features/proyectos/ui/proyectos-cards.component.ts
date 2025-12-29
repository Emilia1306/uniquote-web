import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Proyecto } from '../data/proyectos.types';

@Component({
  selector: 'proyectos-cards',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
  <div class="grid gap-6 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
    <article *ngFor="let p of items" class="card card-hover p-6 relative h-full flex flex-col">

      <!-- Acciones -->
      <div class="absolute top-3 right-3">
        <button class="btn-icon" (click)="toggleMenu(p.id)">⋮</button>

        <div *ngIf="openMenu === p.id" class="card absolute right-0 mt-2 p-2 z-50 w-36">

          <button class="dropdown-item" (click)="onVer(p.id)">Ver cotizaciones</button>
          <button class="dropdown-item" (click)="onEditar(p)">Editar</button>
          <button class="dropdown-item text-red-500"
                  (click)="onEliminar(p)">
            Eliminar
          </button>

        </div>
      </div>

      <!-- Header sin count -->
      <div class="flex justify-between items-start mb-2">
        <h2 class="text-xl font-semibold pr-8 min-h-[3.5rem] line-clamp-2">{{ p.name }}</h2>
      </div>

      <p class="muted text-sm">
        Cliente: <b>{{ p.cliente.empresa }}</b>
      </p>

      <p class="muted text-sm">
        Contacto: {{ p.contacto?.nombre || '—' }}
      </p>

      <!-- Fecha movida aquí -->
      <p class="muted text-sm mt-1">
        Creado: {{ p.createdAt | date:'dd/MM/yy' }}
      </p>

      <div class="divider mt-auto"></div>

      <!-- Footer con count -->
      <div class="flex flex-col items-center ml-auto w-fit">
        <div class="text-3xl font-bold text-[color:var(--brand)] leading-none">{{ p._count.cotizaciones || 0 }}</div>
        <div class="text-xs text-black font-medium mt-1">cot.</div>
      </div>

    </article>
  </div>
  `
})
export class ProyectosCardsComponent {

  @Input() items: Proyecto[] = [];

  @Output() ver = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Proyecto>();
  @Output() eliminar = new EventEmitter<Proyecto>();

  openMenu: number | null = null;

  toggleMenu(id: number) {
    this.openMenu = this.openMenu === id ? null : id;
  }

  onVer(id: number) {
    this.ver.emit(id);
    this.openMenu = null;
  }

  onEditar(p: Proyecto) {
    this.editar.emit(p);
    this.openMenu = null;
  }

  onEliminar(p: Proyecto) {
    this.eliminar.emit(p);
    this.openMenu = null;
  }
}
