import { Component, signal, inject } from '@angular/core';
import {
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';

import { WizardStepperComponent } from '../../cotizaciones/ui/wizard-stepper/wizard-stepper.component';

import { Step1TipoEstudioComponent } from './step1/step1-tipo-estudio.component';
import { Step2DatosComponent } from './step2/step2-datos.component';
import { Step3EntregablesComponent } from './step3/step3-entregables.component';
import { Step4ResumenComponent } from './step4/step4-resumen.component';

import { CotizacionWizardStore } from './wizard.store';
import { CotizacionesApi } from '../../cotizaciones/data/cotizaciones.api';

import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'crear-cotizacion-page',
  standalone: true,
  templateUrl: './crear-cotizacion.page.html',
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,

    LucideAngularModule,

    WizardStepperComponent,
    Step1TipoEstudioComponent,
    Step2DatosComponent,
    Step3EntregablesComponent,
    Step4ResumenComponent,
  ]
})
export class CrearCotizacionPage {

  stepIndex = signal(0);

  private store = inject(CotizacionWizardStore);
  private api = inject(CotizacionesApi);
  private router = inject(Router);

  cancel() {
    window.history.back();
  }

  prev() {
    if (this.stepIndex() > 0) {
      this.stepIndex.update(v => v - 1);
    }
  }

  async onNext() {
    const step = this.stepIndex();

    // 🔥 VALIDAR EL PASO ACTUAL (CORRECTO)
    if (!this.store.isValidStep(step)) {
      alert('Completa todos los campos antes de continuar.');
      return;
    }

    // Si no es el último paso → avanzar
    if (step < 3) {
      this.stepIndex.update(v => v + 1);
      return;
    }

    // Último paso → enviar al API
    const payload = this.store.finalPayload();

    try {
      const res = await firstValueFrom(this.api.create(payload));
      this.router.navigate(['/cotizaciones', res.id]);
    } catch (error) {
      console.error(error);
      alert('Error creando la cotización.');
    }
  }
}
