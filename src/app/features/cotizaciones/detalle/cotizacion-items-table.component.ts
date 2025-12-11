import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'cotizacion-items-table',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card p-6 overflow-x-auto">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-lg">Desglose de costos</h3>
      
      <div class="flex gap-2">
        <button 
          *ngIf="!isEditMode"
          (click)="isEditMode = true"
          class="px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-opacity">
          Editar
        </button>
        
        <button 
          *ngIf="isEditMode"
          (click)="isEditMode = false"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity">
          Guardar
        </button>
        
        <button 
          *ngIf="isEditMode"
          (click)="isEditMode = false"
          class="px-4 py-2 bg-zinc-500 text-white rounded-lg hover:opacity-90 transition-opacity">
          Cancelar
        </button>
      </div>
    </div>

    <table class="w-full text-sm">
      <thead class="text-left text-zinc-500 border-b">
        <tr>
          <th class="py-2 px-3">Descripción</th>
          <th class="py-2 px-3 text-center">Personas</th>
          <th class="py-2 px-3 text-center">Días</th>
          <th class="py-2 px-3 text-right">Costo Unitario</th>
          <th class="py-2 px-3 text-right">Total</th>
        </tr>
      </thead>

      <tbody>
        <ng-container *ngFor="let category of categories">
          <!-- Category Header Row -->
          <tr class="bg-zinc-100 border-t-2 border-zinc-300">
            <td colspan="5" class="py-2 px-3 font-semibold text-zinc-800 uppercase text-xs">
              {{ category }}
            </td>
          </tr>

          <!-- Item Rows -->
          <tr *ngFor="let item of getItemsByCategory(category)" class="border-b hover:bg-zinc-50">
            <!-- Description -->
            <td class="py-2 px-3">
              <span *ngIf="!isEditMode">{{ item.description }}</span>
              <input *ngIf="isEditMode"
                     type="text"
                     [(ngModel)]="item.description"
                     class="w-full px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:border-[var(--brand)]">
            </td>

            <!-- Personas -->
            <td class="py-2 px-3 text-center">
              <span *ngIf="!isEditMode">{{ item.personas }}</span>
              <input *ngIf="isEditMode"
                     type="number"
                     [(ngModel)]="item.personas"
                     class="w-full px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:border-[var(--brand)] text-center">
            </td>

            <!-- Días -->
            <td class="py-2 px-3 text-center">
              <span *ngIf="!isEditMode">{{ item.dias }}</span>
              <input *ngIf="isEditMode"
                     type="number"
                     [(ngModel)]="item.dias"
                     class="w-full px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:border-[var(--brand)] text-center">
            </td>

            <!-- Costo Unitario -->
            <td class="py-2 px-3 text-right">
              <span *ngIf="!isEditMode">$ {{ item.costoUnitario }}</span>
              <input *ngIf="isEditMode"
                     type="number"
                     [(ngModel)]="item.costoUnitario"
                     class="w-full px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:border-[var(--brand)] text-right">
            </td>

            <!-- Total (Read-only) -->
            <td class="py-2 px-3 text-right font-semibold">
              $ {{ item.totalConComision }}
            </td>
          </tr>
        </ng-container>
      </tbody>
    </table>
  </div>
  `
})
export class CotizacionItemsTableComponent {
  @Input() items: any[] = [];
  isEditMode = false;

  get categories(): string[] {
    const cats = new Set<string>();
    this.items.forEach(item => {
      cats.add(item.category || 'SIN CATEGORÍA');
    });
    return Array.from(cats);
  }

  getItemsByCategory(category: string): any[] {
    return this.items.filter(item => (item.category || 'SIN CATEGORÍA') === category);
  }
}
