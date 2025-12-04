import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionWizardStore } from './wizard.store';

@Component({
  standalone: true,
  selector: 'step4-resumen',
  imports: [CommonModule],
  template: `
  <h2 class="text-2xl font-semibold mb-4">Resumen</h2>

  <div class="card p-6">
    <h3 class="text-lg font-semibold mb-2">{{ d.name || 'Nueva Cotización' }}</h3>

    <p class="muted mb-4">
      Verifica que los datos sean correctos antes de crear la cotización.
    </p>

    <pre class="text-sm bg-zinc-100 rounded p-4 overflow-auto">
{{ d | json }}
    </pre>
  </div>
  `
})
export class Step4ResumenComponent {
  store = inject(CotizacionWizardStore);
  d = this.store.data();
}
