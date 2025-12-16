import { Component, signal, inject } from '@angular/core';
import {
  NgIf,
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';

import { WizardStepperComponent } from '../../cotizaciones/ui/wizard-stepper/wizard-stepper.component';

import { Step1TipoEstudioComponent } from './step1/step1-tipo-estudio.component';
import { Step2DatosComponent } from './step2/step2-datos.component';
import { Step3EntregablesComponent } from './step3/step3-entregables.component';
import { Step4ResumenComponent } from './step4/step4-resumen.component';

import { CotizacionWizardStore } from './wizard.store';
import { CotizacionesApi } from '../../cotizaciones/data/cotizaciones.api';

import { Location } from '@angular/common'; // Added import
import { ClientesApi } from '../../clientes/data/clientes.api';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { ProyectosApi } from '../../proyectos/data/proyectos.api';

@Component({
  selector: 'crear-cotizacion-page',
  standalone: true,
  templateUrl: './crear-cotizacion.page.html',
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
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
  editMode = false;
  editId: number | null = null;
  loading = false;

  private store = inject(CotizacionWizardStore);
  private api = inject(CotizacionesApi);
  private clientesApi = inject(ClientesApi); // Inject ClientesApi
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private proyectosApi = inject(ProyectosApi); // Inject ProyectosApi
  private location = inject(Location); // Inject Location

  async ngOnInit() {
    this.store.reset();
    const id = this.route.snapshot.paramMap.get('id');
    const projectId = this.route.snapshot.queryParamMap.get('projectId');

    if (id) {
      this.editMode = true;
      this.editId = Number(id);
      await this.loadForEdit(this.editId);
    } else if (projectId) {
      // Pre-fill from Project
      await this.loadFromProject(Number(projectId));
    }
  }

  async loadFromProject(projectId: number) {
    this.loading = true;
    try {
      const project: any = await firstValueFrom(this.proyectosApi.getOne(projectId));
      if (project) {
        this.store.patch({
          projectId: project.id,
          clienteId: project.cliente?.id,
          contactoId: project.contacto?.id,

          // Display
          clientName: project.cliente?.empresa,
          contactName: project.contacto?.nombre,
          projectName: project.name
        });
      }
    } catch (error) {
      console.error('Error loading project details', error);
    } finally {
      this.loading = false;
    }
  }

  async loadForEdit(id: number) {
    this.loading = true;
    try {
      const cot: any = await firstValueFrom(this.api.getById(id));

      // Patch store
      this.store.patch({
        projectId: cot.project?.id || cot.projectId,
        contactoId: cot.contacto?.id || cot.contactoId,
        name: cot.name,

        studyType: cot.studyType,
        metodologia: cot.metodologia,
        numeroOlasBi: cot.numeroOlasBi ?? 1,
        totalEntrevistas: cot.totalEntrevistas,
        duracionCuestionarioMin: cot.duracionCuestionarioMin,
        tipoEntrevista: cot.tipoEntrevista,
        penetracionCategoria: cot.penetracionCategoria,
        cobertura: cot.cobertura,
        supervisores: cot.supervisores,
        encuestadoresTotales: cot.encuestadoresTotales,

        trabajoDeCampoRealiza: cot.trabajoDeCampoRealiza,
        trabajoDeCampoTipo: cot.trabajoDeCampoTipo,
        trabajoDeCampoCosto: cot.trabajoDeCampoCosto,

        realizamosCuestionario: cot.realizamosCuestionario,
        realizamosScript: cot.realizamosScript,
        clienteSolicitaReporte: cot.clienteSolicitaReporte,
        clienteSolicitaInformeBI: cot.clienteSolicitaInformeBI,
        incentivoTotal: cot.incentivoTotal,

        // Display
        clientName: cot.project?.cliente?.empresa,
        contactName: cot.contacto?.nombre,
        projectName: cot.project?.name
      });

    } catch (error) {
      console.error(error);
      alert('Error cargando la cotización para editar.');
      this.router.navigate(['/cotizaciones']);
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.location.back();
  }

  prev() {
    if (this.stepIndex() > 0) {
      this.stepIndex.update(v => v - 1);
    }
  }

  async onNext() {
    const step = this.stepIndex();

    // 🔥 VALIDAR EL PASO ACTUAL
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
      if (this.editMode && this.editId) {
        // UPDATE
        await firstValueFrom(this.api.update(this.editId, payload));
        alert('Cotización actualizada correctamente');
        // Invalidar cache de clientes para refrescar contadores
        this.clientesApi.clearCache();
        this.location.back();
      } else {
        // CREATE
        await firstValueFrom(this.api.create(payload));
        // alert('Cotización creada correctamente'); // Opcional
        // Invalidar cache de clientes para refrescar contadores
        this.clientesApi.clearCache();
        this.location.back();
      }
    } catch (error) {
      console.error(error);
      alert('Error guardando la cotización.');
    }
  }
}
