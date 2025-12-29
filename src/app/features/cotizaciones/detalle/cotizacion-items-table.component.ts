import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'cotizacion-items-table',
  imports: [CommonModule],
  template: `
  <div class="card p-6 overflow-hidden"> 
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-lg">Desglose de costos</h3>
    </div>

    <div class="table-responsive">
      <table class="w-full text-sm min-w-[600px]">
        <thead class="text-left text-zinc-500 border-b">
          <tr>
            <th class="py-2 px-3">Descripción</th>
            <th class="py-2 px-3 text-center">Personas</th>
            <th class="py-2 px-3 text-center">Días</th>
            <th class="py-2 px-3 text-right">Costo Unitario</th>
            <th class="py-2 px-3 text-right">Total</th>
            <th *ngIf="canEdit" class="py-2 px-3 w-10"></th>
          </tr>
        </thead>

        <tbody>
          <ng-container *ngFor="let category of categories">
            <!-- Category Header Row -->
            <tr class="bg-zinc-100 border-t-2 border-zinc-300">
              <td [attr.colspan]="canEdit ? 6 : 5" class="py-2 px-3 font-semibold text-zinc-800 uppercase text-xs">
                {{ category }}
              </td>
            </tr>

            <!-- Item Rows -->
            <tr *ngFor="let item of getItemsByCategory(category)" class="border-b hover:bg-zinc-50 group">
              <!-- Description -->
              <td class="py-2 px-3">
                {{ item.description }}
              </td>

              <!-- Personas -->
              <td class="py-2 px-3 text-center">
                {{ item.personas }}
              </td>

              <!-- Días -->
              <td class="py-2 px-3 text-center">
                {{ item.dias }}
              </td>

              <!-- Costo Unitario -->
              <td class="py-2 px-3 text-right">
                $ {{ getNumber(item.costoUnitario) | number:'1.2-2' }}
              </td>

              <!-- Total -->
              <td class="py-2 px-3 text-right font-semibold">
                $ {{ getNumber(item.totalConComision) | number:'1.2-2' }}
              </td>

              <!-- Actions -->
               <td *ngIf="canEdit" class="py-2 px-3 text-right">
                <button 
                  (click)="editItem.emit(item)"
                  class="p-1.5 rounded-full hover:bg-[var(--brand)]/10 text-zinc-300 hover:text-[var(--brand)] transition-all"
                  title="Editar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>
  </div>
  `
})
export class CotizacionItemsTableComponent {
  @Input() items: any[] = [];
  @Input() canEdit = false;
  @Output() editItem = new EventEmitter<any>();

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

  getNumber(val: any): number {
    if (val === null || val === undefined || val === '') return 0;
    return Number(val) || 0;
  }
}
