import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiModalComponent } from '../../ui-modal/ui-modal.component';

@Component({
  standalone: true,
  selector: 'modal-crear-cliente',
  imports: [CommonModule, FormsModule, UiModalComponent],
  templateUrl: './modal-crear-cliente.component.html'
})
export class ModalCrearClienteComponent {

  open = false;

  nombre = '';
  razonSocial = '';

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
      empresa: this.nombre,
      razonSocial: this.razonSocial
    });

    this.hide();
    this.resetForm();
  }

  resetForm() {
    this.nombre = '';
    this.razonSocial = '';
  }
}
