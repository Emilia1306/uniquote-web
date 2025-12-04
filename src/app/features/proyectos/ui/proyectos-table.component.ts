import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProyectosStore } from '../data/proyectos.store';

@Component({
  selector: 'proyectos-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
  <div class="card p-4 overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-zinc-500">
          <th class="px-4 py-2 font-medium">Proyecto</th>
          <th class="px-4 py-2 font-medium">Cliente</th>
          <th class="px-4 py-2 font-medium">Contacto</th>
          <th class="px-4 py-2 font-medium">Cotizaciones</th>
          <th class="px-4 py-2 font-medium">Fecha</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-zinc-200">
        <tr *ngFor="let p of store.list()" class="hover:bg-zinc-50">
          <td class="px-4 py-2 font-semibold">{{ p.name }}</td>
          <td class="px-4 py-2">{{ p.cliente.empresa }}</td>
          <td class="px-4 py-2">
            {{ p.contacto?.nombre || '—' }}
          </td>
          <td class="px-4 py-2 text-center">
            {{ p._count?.cotizaciones || 0 }}
          </td>
          <td class="px-4 py-2">
            {{ p.createdAt | date:'dd/MM/yy' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class ProyectosTableComponent {
  store = inject(ProyectosStore);
}
