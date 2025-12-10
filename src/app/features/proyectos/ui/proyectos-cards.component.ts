import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Proyecto } from '../data/proyectos.types';

@Component({
  selector: 'proyectos-cards',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <article *ngFor="let p of items" class="card card-hover p-6 relative">

      <!-- Acciones -->
      <div class="absolute top-3 right-3">
        <button class="btn-icon" (click)="toggleMenu(p.id)">⋮</button>

        <div *ngIf="openMenu === p.id" class="card absolute right-0 mt-2 p-2 z-50 w-36">

          <button class="dropdown-item" (click)="onVer(p.id)">Ver detalle</button>
          <button class="dropdown-item" (click)="onEditar(p)">Editar</button>
          <button class="dropdown-item text-red-500"
                  [disabled]="p._count.cotizaciones > 0"
                  (click)="onEliminar(p)">
            Eliminar
          </button>

        </div>
      </div>

      <div class="flex justify-between items-start">
        <h2 class="text-xl font-semibold">{{ p.name }}</h2>
        <span class="pill pill--blue text-sm">{{ p._count?.cotizaciones || 0 }} cot.</span>
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
        <div class="text-lg font-bold">{{ p.createdAt | date:'dd/MM/yy' }}</div>
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
