import { Injectable, signal, computed } from '@angular/core';

export interface WizardData {
  projectId: number;
  contactoId?: number | null;

  // Paso 1
  studyType: 'cualitativo' | 'cuantitativo' | null;
  metodologia?: string | null;

  // Paso 2
  totalEntrevistas: number | null;
  duracionCuestionarioMin: number | null;
  tipoEntrevista: string | null;
  penetracionCategoria: number | null;
  cobertura: string | null;
  supervisores: number | null;
  encuestadoresTotales: number | null;

  // Paso 3
  realizamosCuestionario: boolean;
  realizamosScript: boolean;
  clienteSolicitaReporte: boolean;
  clienteSolicitaInformeBI: boolean;
  numeroOlasBi: number | null;
  incentivoTotal: number | null;

  trabajoDeCampo: boolean;

  // Nombre cotización
  name: string | null;
}

@Injectable({ providedIn: 'root' })
export class CotizacionWizardStore {

  step = signal(1);

  data = signal<WizardData>({
    projectId: 0,
    studyType: null,
    metodologia: null,

    totalEntrevistas: null,
    duracionCuestionarioMin: null,
    tipoEntrevista: null,
    penetracionCategoria: null,
    cobertura: null,
    supervisores: null,
    encuestadoresTotales: null,

    realizamosCuestionario: false,
    realizamosScript: false,
    clienteSolicitaReporte: false,
    clienteSolicitaInformeBI: false,
    numeroOlasBi: 2,
    incentivoTotal: null,

    trabajoDeCampo: true,
    name: null,
  });

  patch(patch: Partial<WizardData>) {
    this.data.set({
      ...this.data(),
      ...patch
    });
  }

  next() {
    if (this.step() < 4) this.step.set(this.step() + 1);
  }

  back() {
    if (this.step() > 1) this.step.set(this.step() - 1);
  }

  reset() {
    this.step.set(1);
  }

  isValidStep(step: number): boolean {
    const d = this.data();

    if (step === 1) {
      if (!d.studyType) return false;
      if (d.studyType === 'cualitativo' && !d.metodologia) return false;
      return true;
    }

    if (step === 2) {
      return (
        d.totalEntrevistas &&
        d.duracionCuestionarioMin &&
        d.tipoEntrevista &&
        d.penetracionCategoria &&
        d.cobertura &&
        d.supervisores &&
        d.encuestadoresTotales
      ) ? true : false;
    }

    if (step === 3) {
      return true;
    }

    return true;
  }

  finalPayload() {
    const d = this.data();
    return {
      projectId: d.projectId,
      contactoId: d.contactoId ?? null,
      name: d.name ?? 'Nueva cotización',

      studyType: d.studyType,
      metodologia: d.metodologia,
      trabajoDeCampo: d.trabajoDeCampo,
      numeroOlasBi: d.numeroOlasBi,

      totalEntrevistas: d.totalEntrevistas,
      duracionCuestionarioMin: d.duracionCuestionarioMin,
      tipoEntrevista: d.tipoEntrevista,
      penetracionCategoria: d.penetracionCategoria,
      cobertura: d.cobertura,
      supervisores: d.supervisores,
      encuestadoresTotales: d.encuestadoresTotales,

      realizamosCuestionario: d.realizamosCuestionario,
      realizamosScript: d.realizamosScript,
      clienteSolicitaReporte: d.clienteSolicitaReporte,
      clienteSolicitaInformeBI: d.clienteSolicitaInformeBI,
      incentivoTotal: d.incentivoTotal,
    };
  }
}
