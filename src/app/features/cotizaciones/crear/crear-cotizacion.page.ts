import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { CotizacionWizardStore } from './wizard.store';
import { CotizacionesApi } from '../data/cotizaciones.api';

import { Step1TipoEstudioComponent } from './step1-tipo-estudio.component';
import { Step2DatosComponent } from './step2-datos.component';
import { Step3EntregablesComponent } from './step3-entregables.component';
import { Step4ResumenComponent } from './step4-resumen.component';

@Component({
  standalone: true,
  selector: 'crear-cotizacion',
  imports: [
    CommonModule,
    Step1TipoEstudioComponent,
    Step2DatosComponent,
    Step3EntregablesComponent,
    Step4ResumenComponent
  ],
  template: `
  <div class="max-w-[900px] mx-auto px-4 py-6">

    <h1 class="text-3xl font-semibold mb-2">Nueva Cotización</h1>
    <p class="muted mb-6">Sigue los pasos para crear una cotización.</p>

    <!-- Steps indicator -->
    <div class="flex justify-between mb-8">
      <div *ngFor="let s of [1,2,3,4]" class="flex-1 text-center">
        <div class="w-10 h-10 rounded-full mx-auto flex items-center justify-center"
             [class.bg-blue-600]="store.step()===s"
             [class.text-white]="store.step()===s"
             [class.bg-zinc-300]="store.step()!==s">
          {{ s }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <ng-container [ngSwitch]="store.step()">

      <step1-tipo-estudio *ngSwitchCase="1"></step1-tipo-estudio>
      <step2-datos *ngSwitchCase="2"></step2-datos>
      <step3-entregables *ngSwitchCase="3"></step3-entregables>
      <step4-resumen *ngSwitchCase="4"></step4-resumen>

    </ng-container>

    <!-- Nav buttons -->
    <div class="flex justify-between mt-8">

      <button class="btn"
              [disabled]="store.step()===1"
              (click)="store.back()">
        ← Anterior
      </button>

      <button *ngIf="store.step() < 4"
              class="btn btn-primary"
              [disabled]="!store.isValidStep(store.step())"
              (click)="store.next()">
        Siguiente →
      </button>

      <button *ngIf="store.step()===4"
              class="btn btn-primary"
              (click)="create()">
        Crear Cotización
      </button>

    </div>

  </div>
  `
})
export class CrearCotizacionPage {

  store = inject(CotizacionWizardStore);
  api = inject(CotizacionesApi);
  route = inject(ActivatedRoute);
  router = inject(Router);

  ngOnInit() {
    const projectId = Number(this.route.snapshot.queryParamMap.get('projectId'));
    this.store.patch({ projectId });
    this.store.reset();
  }

  async create() {
    const payload = this.store.finalPayload();

    const result = await this.api.create(payload).toPromise();

    if (!result) {
      console.error('Error creando cotización');
      return;
    }

    this.router.navigate(['/cotizaciones', result.id]);
  }

}
