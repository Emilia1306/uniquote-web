import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiModalComponent } from '../../ui-modal/ui-modal.component';

@Component({
  standalone: true,
  selector: 'modal-crear-proyecto',
  imports: [CommonModule, FormsModule, UiModalComponent],
  templateUrl: './modal-crear-proyecto.component.html'
})
export class ModalCrearProyectoComponent {

  @Input() clienteId!: number;
  @Input() contactoId: number | null = null;
  open = false;

  nombre = '';

  @Output() creado = new EventEmitter<any>();

  show() {
    this.resetForm();
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  guardar() {
    if (!this.nombre.trim()) return;

    this.creado.emit({
      clienteId: this.clienteId,
      contactoId: this.contactoId,
      name: this.nombre
    });

    this.hide();
    this.resetForm();
  }

  resetForm() {
    this.nombre = '';
  }
}
