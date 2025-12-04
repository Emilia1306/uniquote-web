import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionWizardStore } from './wizard.store';

@Component({
  standalone: true,
  selector: 'step2-datos',
  imports: [CommonModule, FormsModule],
  template: `
  <h2 class="text-2xl font-semibold mb-2">Datos de la Cotización</h2>
  <p class="muted mb-6">Ingresa los parámetros técnicos del estudio.</p>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <div>
      <label class="form-label">Total entrevistas *</label>
      <input type="number" class="form-input" [(ngModel)]="d.totalEntrevistas"
             (ngModelChange)="patch()" />
    </div>

    <div>
      <label class="form-label">Duración cuestionario (min) *</label>
      <input type="number" class="form-input" [(ngModel)]="d.duracionCuestionarioMin"
             (ngModelChange)="patch()" />
    </div>

    <div>
      <label class="form-label">Tipo de entrevista *</label>
      <select class="form-input" [(ngModel)]="d.tipoEntrevista" (ngModelChange)="patch()">
        <option value="">Seleccione</option>
        <option value="casa">Casa × Casa</option>
        <option value="telefono">Telefónica</option>
        <option value="online">Online</option>
      </select>
    </div>

    <div>
      <label class="form-label">Penetración categoría (%) *</label>
      <input type="number" class="form-input" [(ngModel)]="d.penetracionCategoria"
             (ngModelChange)="patch()" />
    </div>

    <div>
      <label class="form-label">Cobertura *</label>
      <input class="form-input" [(ngModel)]="d.cobertura" (ngModelChange)="patch()" />
    </div>

    <div>
      <label class="form-label">Supervisores *</label>
      <input type="number" class="form-input" [(ngModel)]="d.supervisores"
             (ngModelChange)="patch()" />
    </div>

    <div>
      <label class="form-label">Encuestadores totales *</label>
      <input type="number" class="form-input" [(ngModel)]="d.encuestadoresTotales"
             (ngModelChange)="patch()" />
    </div>

  </div>
  `
})
export class Step2DatosComponent {
  store = inject(CotizacionWizardStore);
  d = this.store.data();

  patch() {
    this.store.patch({ ...this.d });
  }
}
