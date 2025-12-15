import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionWizardStore, WizardData } from '../wizard.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'step3-entregables',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './step3-entregables.component.html',
  styleUrls: ['./step3-entregables.component.scss']
})
export class Step3EntregablesComponent {
  store = inject(CotizacionWizardStore);

  get d() {
    return this.store.data();
  }

  // --- Olas BI ---
  get tieneOlasExtras() {
    return (this.d.numeroOlasBi || 0) > 2;
  }

  // Setter sin efecto directo (el input binding usa ngModelChange -> onOlasExtrasChange)
  // pero lo dejamos por si acaso.
  set olasExtras(val: number) {
    this.patch({ numeroOlasBi: 2 + val });
  }

  get olasExtras() {
    return (this.d.numeroOlasBi || 2) - 2;
  }

  setOlasExtras(activar: boolean) {
    if (activar) {
      if (this.olasExtras <= 0) {
        this.patch({ numeroOlasBi: 3 });
      }
    } else {
      this.patch({ numeroOlasBi: 2 });
    }
  }

  onOlasExtrasChange() {
    // El ngModel escribe en 'olasExtras' setter
  }

  // --- Toggles ---

  toggle(field: keyof WizardData) {
    const current = this.d[field];
    if (typeof current === 'boolean') {
      const newValue = !current;
      this.patch({ [field]: newValue });

      // Si activamos BI, validar que tengamos al menos 2 olas
      if (field === 'clienteSolicitaInformeBI' && newValue) {
        if ((this.d.numeroOlasBi || 0) < 2) {
          this.patch({ numeroOlasBi: 2 });
        }
      }
    }
  }

  toggleTrabajoCampo() {
    const newVal = !this.d.trabajoDeCampoRealiza;
    this.patch({ trabajoDeCampoRealiza: newVal });

    if (newVal && !this.d.trabajoDeCampoTipo) {
      this.patch({ trabajoDeCampoTipo: 'propio' });
    }
  }

  onChangeTipoTrabajo(tipo: 'propio' | 'subcontratado') {
    this.patch({ trabajoDeCampoTipo: tipo });
  }

  patch(values: Partial<WizardData>) {
    this.store.patch(values);
  }
}
