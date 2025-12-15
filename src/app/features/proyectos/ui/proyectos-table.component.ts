import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Proyecto } from '../data/proyectos.types';

@Component({
  selector: 'proyectos-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
  <div class="card p-4 overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-zinc-500">
          <th class="px-4 py-2">Proyecto</th>
          <th class="px-4 py-2">Cliente</th>
          <th class="px-4 py-2">Contacto</th>
          <th class="px-4 py-2">Cotizaciones</th>
          <th class="px-4 py-2">Fecha</th>
          <th class="px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-zinc-200">
        <tr *ngFor="let p of items" class="hover:bg-zinc-50">

          <td class="px-4 py-2 font-semibold">{{ p.name }}</td>
          <td class="px-4 py-2">{{ p.cliente.empresa }}</td>
          <td class="px-4 py-2">{{ p.contacto?.nombre || '—' }}</td>
          <td class="px-4 py-2 text-center">{{ p._count.cotizaciones || 0 }}</td>
          <td class="px-4 py-2">{{ p.createdAt | date:'dd/MM/yy' }}</td>

          <!-- ACCIONES -->
          <td class="px-4 py-2 text-center relative">

            <button class="btn-icon" (click)="toggleMenu(p.id)">⋮</button>

            <div *ngIf="openMenu === p.id" class="card absolute right-0 mt-2 p-2 w-40 z-50">

              <button class="dropdown-item" (click)="onVer(p.id)">Ver</button>
              <button class="dropdown-item" (click)="onEditar(p)">Editar</button>

              <button class="dropdown-item text-red-500"
                      [disabled]="p._count.cotizaciones > 0"
                      (click)="onEliminar(p)">
                Eliminar
              </button>

            </div>

          </td>

        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class ProyectosTableComponent {

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
