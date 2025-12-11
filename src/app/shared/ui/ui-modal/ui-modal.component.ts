import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ui-modal',
  imports: [CommonModule],
  templateUrl: './ui-modal.component.html',
  styleUrls: ['./ui-modal.component.scss']
})
export class UiModalComponent {

  @Input() title = '';
  @Input() open = false;

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
