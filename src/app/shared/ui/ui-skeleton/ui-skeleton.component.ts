import { Component, Input } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';

@Component({
    selector: 'ui-skeleton',
    standalone: true,
    imports: [NgClass, NgStyle],
    template: `
    <div 
      [ngClass]="['skeleton', variant === 'shimmer' ? 'skeleton-shimmer' : '', className || '']"
      [ngStyle]="{
        'width': width || '100%',
        'height': height || '1em',
        'border-radius': borderRadius || '0.5rem'
      }"
    ></div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class UiSkeletonComponent {
    @Input() width?: string;
    @Input() height?: string;
    @Input() borderRadius?: string;
    @Input() className?: string;
    @Input() variant: 'pulse' | 'shimmer' = 'pulse';
}
