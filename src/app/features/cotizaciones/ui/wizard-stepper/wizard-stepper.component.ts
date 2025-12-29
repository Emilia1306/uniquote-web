import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'wizard-stepper',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, LucideAngularModule],
  templateUrl: './wizard-stepper.component.html',
  styleUrls: ['./wizard-stepper.component.scss'],
})
export class WizardStepperComponent {
  @Input() current = 0; // 0 = primer paso
  @Output() stepChange = new EventEmitter<number>();

  steps = [
    { label: 'Tipo de estudio' },
    { label: 'Datos de cotización' },
    { label: 'Entregables' },
    { label: 'Resumen' },
  ];

  goTo(step: number) {
    this.stepChange.emit(step);
  }
}
