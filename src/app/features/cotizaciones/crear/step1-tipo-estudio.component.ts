import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionWizardStore } from './wizard.store';

@Component({
  standalone: true,
  selector: 'step1-tipo-estudio',
  imports: [CommonModule, FormsModule],  // ✔ IMPORTACIÓN NECESARIA
  template: `
<h2 class="text-2xl font-semibold mb-2">Tipo de Estudio</h2>
<p class="muted mb-6">Selecciona el tipo de estudio que deseas realizar.</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">

  <!-- Cualitativo -->
  <div class="card p-5 cursor-pointer"
       [class.border-blue-500]="store.data().studyType === 'cualitativo'"
       (click)="select('cualitativo')">

    <h3 class="text-lg font-semibold">Estudio Cualitativo</h3>
    <p class="muted text-sm">Análisis profundo basado en textos y observaciones.</p>

    <div *ngIf="store.data().studyType === 'cualitativo'" class="mt-4">
      <label class="block text-sm mb-1">Metodología *</label>

      <select class="form-input w-full"
              [(ngModel)]="store.data().metodologia"
              (ngModelChange)="onMetodologiaChange($event)">
        <option value="">Seleccione</option>
        <option value="grupos">Grupos Focales</option>
        <option value="entrevistas">Entrevistas a profundidad</option>
      </select>
    </div>
  </div>

  <!-- Cuantitativo -->
  <div class="card p-5 cursor-pointer"
       [class.border-blue-500]="store.data().studyType === 'cuantitativo'"
       (click)="select('cuantitativo')">

    <h3 class="text-lg font-semibold">Estudio Cuantitativo</h3>
    <p class="muted text-sm">Análisis basado en datos medibles.</p>

  </div>

</div>
  `
})
export class Step1TipoEstudioComponent {

  store = inject(CotizacionWizardStore);

  select(tipo: 'cualitativo' | 'cuantitativo') {
    this.store.patch({
      studyType: tipo,
      metodologia: tipo === 'cuantitativo' ? null : this.store.data().metodologia
    });
  }


  onMetodologiaChange(value: string) {
    this.store.patch({ metodologia: value });
  }
}
