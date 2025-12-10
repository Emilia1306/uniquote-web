import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionWizardStore } from '../wizard.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  standalone: true,
  selector: 'step1-tipo-estudio',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './step1-tipo-estudio.component.html',
  styleUrls: ['./step1-tipo-estudio.component.scss'],
})
export class Step1TipoEstudioComponent {

  store = inject(CotizacionWizardStore);

  select(tipo: 'Cualitativo' | 'Cuantitativo') {
    this.store.patch({
      studyType: tipo,
      metodologia: null
    });
  }

  isSelected(type: 'Cualitativo' | 'Cuantitativo') {
    return this.store.data().studyType === type;
  }
}
