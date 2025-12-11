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

  // Control para olas extras
  tieneOlasExtras = false;
  olasExtras = 0;

  get d() {
    return this.store.data();
  }

  toggle(field: 'realizamosCuestionario' | 'realizamosScript' | 'clienteSolicitaReporte' | 'clienteSolicitaInformeBI') {
    const newValue = !this.d[field];

    console.log(`Toggling ${field} to ${newValue}`);

    this.store.patch({
      [field]: newValue
    });

    // Si se activa BI, establecer 2 olas por defecto
    if (field === 'clienteSolicitaInformeBI' && newValue) {
      console.log('Activando BI con 2 olas por defecto');
      this.tieneOlasExtras = false;
      this.olasExtras = 0;
      this.store.patch({ numeroOlasBi: 2 });
    }

    // Si se desactiva BI, resetear olas
    if (field === 'clienteSolicitaInformeBI' && !newValue) {
      console.log('Desactivando BI');
      this.tieneOlasExtras = false;
      this.olasExtras = 0;
      this.store.patch({ numeroOlasBi: 0 });
    }

    console.log('Estado actual:', this.d);
  }

  onOlasExtrasToggle() {
    if (this.tieneOlasExtras) {
      this.olasExtras = 0;
      this.actualizarTotalOlas();
    } else {
      // Resetear a 2 olas base
      this.store.patch({ numeroOlasBi: 2 });
    }
  }

  setOlasExtras(value: boolean) {
    this.tieneOlasExtras = value;
    if (!value) {
      // Si selecciona "No", resetear a 2 olas base
      this.olasExtras = 0;
      this.store.patch({ numeroOlasBi: 2 });
    }
  }

  onOlasExtrasChange() {
    this.actualizarTotalOlas();
  }

  actualizarTotalOlas() {
    const totalOlas = 2 + (this.olasExtras || 0);
    this.store.patch({ numeroOlasBi: totalOlas });
  }

  patch() {
    this.store.patch({ ...this.d });
  }
}
