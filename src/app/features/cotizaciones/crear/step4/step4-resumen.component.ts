import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionWizardStore } from '../wizard.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'step4-resumen',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './step4-resumen.component.html',
  styleUrls: ['./step4-resumen.component.scss']
})
export class Step4ResumenComponent {
  store = inject(CotizacionWizardStore);

  get d() {
    return this.store.data();
  }

  get hasEntregables() {
    return this.d.realizamosCuestionario ||
      this.d.realizamosScript ||
      this.d.clienteSolicitaReporte ||
      this.d.clienteSolicitaInformeBI;
  }

  penteracionLabel(val: number | null): string {
    if (val === null) return '-';
    if (val >= 80) return 'Fácil (+80%)';
    if (val >= 50) return 'Normal (50% - 80%)';
    if (val < 50) return 'Difícil (-50%)';
    return `${val}% (Personalizada)`;
  }
}
