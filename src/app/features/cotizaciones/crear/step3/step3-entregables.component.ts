import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionWizardStore } from '../wizard.store';

@Component({
  standalone: true,
  selector: 'step3-entregables',
  imports: [CommonModule, FormsModule],
  template: `
  <h2 class="text-2xl font-semibold mb-2">Entregables</h2>
  <p class="muted mb-6">Selecciona los entregables solicitados por el cliente.</p>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <label class="flex gap-3 items-center">
      <input type="checkbox" [(ngModel)]="d.realizamosCuestionario"
             (ngModelChange)="patch()" />
      Realizamos cuestionario
    </label>

    <label class="flex gap-3 items-center">
      <input type="checkbox" [(ngModel)]="d.realizamosScript"
             (ngModelChange)="patch()" />
      Realizamos script
    </label>

    <label class="flex gap-3 items-center">
      <input type="checkbox" [(ngModel)]="d.clienteSolicitaReporte"
             (ngModelChange)="patch()" />
      Cliente solicita reporte
    </label>

    <label class="flex gap-3 items-center">
      <input type="checkbox" [(ngModel)]="d.clienteSolicitaInformeBI"
             (ngModelChange)="patch()" />
      Cliente solicita informe BI
    </label>

    <div>
      <label class="form-label">Número de olas BI</label>
      <input type="number" class="form-input"
             [(ngModel)]="d.numeroOlasBi"
             (ngModelChange)="patch()" />
    </div>

    <div>
      <label class="form-label">Incentivo total ($)</label>
      <input type="number" class="form-input"
             [(ngModel)]="d.incentivoTotal"
             (ngModelChange)="patch()" />
    </div>

  </div>
  `
})
export class Step3EntregablesComponent {
  store = inject(CotizacionWizardStore);
  d = this.store.data();

  patch() {
    this.store.patch({ ...this.d });
  }
}
