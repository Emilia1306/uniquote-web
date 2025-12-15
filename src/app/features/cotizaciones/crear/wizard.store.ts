import { Injectable, signal } from '@angular/core';

export interface WizardData {
  projectId: number | null;
  clienteId: number | null; // Added field
  contactoId: number | null;

  // Paso 1 — Tipo de estudio
  studyType: 'Cualitativo' | 'Cuantitativo' | null;

  // Paso 2 — Datos técnicos
  metodologia: string | null;
  numeroOlasBi: number | null;
  totalEntrevistas: number | null;
  duracionCuestionarioMin: number | null;
  tipoEntrevista: string | null;
  penetracionCategoria: number | null;
  cobertura: string | null;
  supervisores: number | null;
  encuestadoresTotales: number | null;

  // Trabajo de campo (también en paso 2)
  trabajoDeCampoRealiza: boolean | null;
  trabajoDeCampoTipo: 'propio' | 'subcontratado' | null;
  trabajoDeCampoCosto: number | null;

  // Paso 3 — Entregables
  realizamosCuestionario: boolean;
  realizamosScript: boolean;
  clienteSolicitaReporte: boolean;
  clienteSolicitaInformeBI: boolean;
  clienteSolicitaTablas: boolean; // NEW
  incentivoTotal: number | null;

  // Nombre de la cotización
  name: string | null;

  // Display fields for Summary
  clientName?: string;
  contactName?: string;
  projectName?: string;
  metodologiaLabel?: string;
  coberturaLabel?: string;
}

@Injectable({ providedIn: 'root' })
export class CotizacionWizardStore {

  // Paso actual: 0 = paso 1, 1 = paso 2, etc.
  step = signal(0);

  data = signal<WizardData>({
    projectId: null,
    clienteId: null,
    contactoId: null,

    // Paso 1
    studyType: null,

    // Paso 2
    metodologia: null,
    numeroOlasBi: 2, // Default 2
    totalEntrevistas: null,
    duracionCuestionarioMin: null,
    tipoEntrevista: null,
    penetracionCategoria: null,
    cobertura: null,
    supervisores: null,
    encuestadoresTotales: null,

    // Trabajo de campo
    trabajoDeCampoRealiza: null,
    trabajoDeCampoTipo: null,
    trabajoDeCampoCosto: null,

    // Paso 3 — entregables
    realizamosCuestionario: false,
    realizamosScript: false,
    clienteSolicitaReporte: false,
    clienteSolicitaInformeBI: false,
    clienteSolicitaTablas: false, // NEW
    incentivoTotal: null,

    name: null,

    // Display
    clientName: '',
    contactName: '',
    projectName: '',
    metodologiaLabel: '',
    coberturaLabel: ''
  });

  patch(values: Partial<WizardData>) {
    this.data.set({
      ...this.data(),
      ...values
    });
  }

  next() {
    if (this.step() < 3) this.step.update(v => v + 1);
  }

  back() {
    if (this.step() > 0) this.step.update(v => v - 1);
  }

  reset() {
    this.step.set(0);
    this.data.set({
      projectId: null,
      clienteId: null,
      contactoId: null,

      // Paso 1
      studyType: null,

      // Paso 2
      metodologia: null,
      numeroOlasBi: 2, // Default 2
      totalEntrevistas: null,
      duracionCuestionarioMin: null,
      tipoEntrevista: null,
      penetracionCategoria: null,
      cobertura: null,
      supervisores: null,
      encuestadoresTotales: null,

      // Trabajo de campo
      trabajoDeCampoRealiza: null,
      trabajoDeCampoTipo: null,
      trabajoDeCampoCosto: null,

      // Paso 3 — entregables
      realizamosCuestionario: false,
      realizamosScript: false,
      clienteSolicitaReporte: false,
      clienteSolicitaInformeBI: false,
      clienteSolicitaTablas: false, // NEW
      incentivoTotal: null,

      name: null,

      // Display
      clientName: '',
      contactName: '',
      projectName: '',
      metodologiaLabel: '',
      coberturaLabel: ''
    });
  }

  // ======================
  // VALIDACIONES POR PASO
  // ======================

  isValidStep(step: number): boolean {
    const d = this.data();

    // PASO 1 — Solo pide tipo de estudio
    if (step === 0) {
      return !!d.studyType;
    }

    // PASO 2 — Datos técnicos + metodología
    if (step === 1) {

      if (
        !d.projectId ||
        !d.contactoId ||
        !d.metodologia ||
        d.totalEntrevistas == null ||
        d.duracionCuestionarioMin == null ||
        d.penetracionCategoria == null ||
        !d.cobertura
      ) return false;

      return true;
    }

    // PASO 3 — Entregables + Trabajo de Campo
    if (step === 2) {
      // Validación trabajo de campo
      if (d.trabajoDeCampoRealiza) {
        if (!d.trabajoDeCampoTipo) return false;

        if (d.trabajoDeCampoTipo === 'subcontratado' &&
          d.trabajoDeCampoCosto == null) return false;

        if (d.trabajoDeCampoTipo === 'propio' &&
          (d.supervisores == null || d.encuestadoresTotales == null)) return false;
      }
      return true;
    }

    return true;
  }

  // ======================
  // PAYLOAD FINAL API
  // ======================

  finalPayload() {
    const d = this.data();

    return {
      projectId: d.projectId!,
      contactoId: d.contactoId,
      name: d.name ?? 'Nueva Cotización',

      // Paso 1
      studyType: d.studyType,

      // Paso 2
      metodologia: d.metodologia,
      numeroOlasBi: d.numeroOlasBi,
      totalEntrevistas: d.totalEntrevistas,
      duracionCuestionarioMin: d.duracionCuestionarioMin,
      tipoEntrevista: d.metodologia, // Mapping methodology to interview type to satisfy API
      penetracionCategoria: d.penetracionCategoria,
      cobertura: d.cobertura,
      supervisores: d.supervisores ?? 0,
      encuestadoresTotales: d.encuestadoresTotales ?? 0,

      // Trabajo de campo
      trabajoDeCampoRealiza: d.trabajoDeCampoRealiza,
      trabajoDeCampoTipo: d.trabajoDeCampoTipo,
      trabajoDeCampoCosto: d.trabajoDeCampoCosto ?? 0,

      // Paso 3
      realizamosCuestionario: d.realizamosCuestionario,
      realizamosScript: d.realizamosScript,
      clienteSolicitaReporte: d.clienteSolicitaReporte,
      clienteSolicitaInformeBI: d.clienteSolicitaInformeBI,
      clienteSolicitaTablas: d.clienteSolicitaTablas,
      incentivoTotal: d.incentivoTotal ?? 0
    };
  }
}
