import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'cotizacion-items-table',
  imports: [CommonModule],
  template: `
  <div class="card p-6 overflow-x-auto">
    <h3 class="font-semibold text-lg mb-4">Desglose de costos</h3>

    <table class="w-full text-sm">
      <thead class="text-left text-zinc-500 border-b">
        <tr>
          <th class="py-2 px-3">Categoría</th>
          <th class="py-2 px-3">Descripción</th>
          <th class="py-2 px-3">Personas</th>
          <th class="py-2 px-3">Días</th>
          <th class="py-2 px-3">Costo Unitario</th>
          <th class="py-2 px-3">Total</th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let i of items" class="border-b last:border-0">
          <td class="py-2 px-3">{{ i.category }}</td>
          <td class="py-2 px-3">{{ i.description }}</td>
          <td class="py-2 px-3">{{ i.personas }}</td>
          <td class="py-2 px-3">{{ i.dias }}</td>
          <td class="py-2 px-3">$ {{ i.costoUnitario }}</td>
          <td class="py-2 px-3 font-semibold">$ {{ i.totalConComision }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class CotizacionItemsTableComponent {
  @Input() items: any[] = [];
}
