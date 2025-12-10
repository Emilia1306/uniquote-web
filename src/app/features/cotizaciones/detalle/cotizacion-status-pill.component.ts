import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'cotizacion-status-pill',
  imports: [CommonModule],
  template: `
  <span class="pill"
        [ngClass]="{
          'pill--ok': status === 'APROBADO',
          'bg-yellow-100 text-yellow-700 border-yellow-300': status === 'NEGOCIACION',
          'bg-zinc-200 text-zinc-700 border-zinc-300': status === 'EN_PAUSA',
          'bg-red-100 text-red-700 border-red-300': status === 'NO_APROBADO'
        }">
    {{ status | titlecase }}
  </span>
  `
})
export class CotizacionStatusPillComponent {
  @Input() status!: string;
}
