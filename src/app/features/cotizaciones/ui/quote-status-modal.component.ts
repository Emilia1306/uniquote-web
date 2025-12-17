import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { UiSelectComponent, UiSelectItem } from '../../../shared/ui/ui-select/ui-select.component';
import { CotizacionesStore } from '../data/quotes.store';

@Component({
  selector: 'quote-status-modal',
  standalone: true,
  imports: [CommonModule, UiSelectComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-xl w-[400px]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-zinc-900">Cambiar estado</h2>
        <button (click)="close()" class="text-zinc-400 hover:text-zinc-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <p class="text-sm text-zinc-500 mb-4">
          Selecciona el nuevo estado para la cotización 
          <span class="font-medium text-zinc-700">{{ data.code }}</span>
        </p>

        <ui-select
          [items]="filteredStatusItems()"
          [value]="selectedStatus()"
          (valueChange)="selectedStatus.set($event)"
          placeholder="Seleccionar estado..."
        ></ui-select>
        
        <div class="mt-6 flex justify-end gap-2">
          <button 
            class="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-200"
            (click)="close()">
            Cancelar
          </button>
          <button 
            class="px-4 py-2 text-sm font-medium text-white bg-[var(--brand)] rounded-lg hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50"
            [disabled]="loading() || !selectedStatus()"
            (click)="save()">
            {{ loading() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class QuoteStatusModalComponent {
  selectedStatus = signal<string>('');
  loading = signal(false);

  allStatusItems: UiSelectItem[] = [
    { value: 'ENVIADO', label: 'Enviado' },
    { value: 'NEGOCIACION', label: 'Negociación' },
    { value: 'APROBADO', label: 'Aprobado' },
    { value: 'NO_APROBADO', label: 'No Aprobado' },
    { value: 'EN_PAUSA', label: 'En Pausa' },
    { value: 'REEMPLAZADA', label: 'Reemplazada' },
  ];

  filteredStatusItems = signal<UiSelectItem[]>([]);

  constructor(
    @Inject(DIALOG_DATA) public data: { id: number; code: string; currentStatus: string },
    private dialogRef: DialogRef,
    private store: CotizacionesStore
  ) {
    this.selectedStatus.set(data.currentStatus);
    this.computeAllowedStatuses(data.currentStatus);
  }

  computeAllowedStatuses(current: string) {
    // Definimos las transiciones permitidas
    // Si no está definido, asumimos que puede ir a cualquiera (fallback)
    const allowed = this.getAllowedTargetStatuses(current);

    this.filteredStatusItems.set(
      this.allStatusItems.filter(item => allowed.includes(item.value))
    );
  }

  getAllowedTargetStatuses(current: string): string[] {
    const ALL = ['ENVIADO', 'NEGOCIACION', 'APROBADO', 'NO_APROBADO', 'EN_PAUSA', 'REEMPLAZADA'];

    switch (current) {
      case 'ENVIADO':
        // Desde ENVIADO puede ir a cualquiera (avanzar a NEGOCIACION o saltar a finales)
        return ['NEGOCIACION', 'APROBADO', 'NO_APROBADO', 'EN_PAUSA', 'REEMPLAZADA'];

      case 'NEGOCIACION':
        // Desde NEGOCIACION NO puede volver a ENVIADO
        return ['APROBADO', 'NO_APROBADO', 'EN_PAUSA', 'REEMPLAZADA'];

      case 'EN_PAUSA':
        // Desde PAUSA puede reanudar NEGOCIACION o ir a final
        return ['NEGOCIACION', 'APROBADO', 'NO_APROBADO', 'REEMPLAZADA'];

      case 'APROBADO':
      case 'NO_APROBADO':
      case 'REEMPLAZADA':
        // Estados finales usualmente no cambian, pero si se abriera la modal:
        return ALL; // O restringir totalmente

      default:
        return ALL;
    }
  }

  close() {
    this.dialogRef.close();
  }

  async save() {
    if (!this.selectedStatus()) return;

    this.loading.set(true);
    try {
      await this.store.updateStatus(this.data.id, this.selectedStatus());
      this.close();
    } catch (err) {
      console.error('Error updating status', err);
    } finally {
      this.loading.set(false);
    }
  }
}
