import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionWizardStore } from '../wizard.store';

@Component({
  standalone: true,
  selector: 'step3-entregables',
  imports: [CommonModule, FormsModule],
  templateUrl: './step3-entregables.component.html',
  styleUrls: ['./step3-entregables.component.scss']
})
export class Step3EntregablesComponent {
  store = inject(CotizacionWizardStore);

  get d() {
    return this.store.data();
  }

  toggle(field: 'realizamosCuestionario' | 'realizamosScript' | 'clienteSolicitaReporte' | 'clienteSolicitaInformeBI') {
    this.store.patch({
      [field]: !this.d[field]
    });
  }

  patch() {
    this.store.patch({ ...this.d });
  }
}
