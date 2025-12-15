import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiModalComponent } from '../../ui-modal/ui-modal.component';

@Component({
  standalone: true,
  selector: 'modal-crear-contacto',
  imports: [CommonModule, FormsModule, UiModalComponent],
  templateUrl: './modal-crear-contacto.component.html'
})
export class ModalCrearContactoComponent {

  @Input() clienteId!: number;
  open = false;

  nombre = '';
  telefono = '';
  email = '';

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
      nombre: this.nombre,
      telefono: this.telefono,
      email: this.email
    });

    this.hide();
    this.resetForm();
  }

  resetForm() {
    this.nombre = '';
    this.telefono = '';
    this.email = '';
  }
}
