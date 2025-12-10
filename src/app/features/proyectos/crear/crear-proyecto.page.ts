import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProyectosStore } from '../data/proyectos.store';

@Component({
  standalone: true,
  selector: 'proyecto-create-modal',
  imports: [CommonModule, FormsModule],
  template: `
  <dialog #dlg class="modal">
    <form method="dialog" class="modal-box max-w-md">

      <h3 class="font-bold text-lg mb-4">Nuevo Proyecto</h3>

      <label class="block mb-2">Nombre del proyecto</label>
      <input class="input w-full mb-4" [(ngModel)]="name" name="name"/>

      <label class="block mb-2">Cliente ID</label>
      <input class="input w-full mb-4" type="number" [(ngModel)]="clienteId" name="clienteId"/>

      <label class="block mb-2">Contacto ID (opcional)</label>
      <input class="input w-full mb-6" type="number" [(ngModel)]="contactoId" name="contactoId"/>

      <div class="flex justify-end gap-3">
        <button class="btn" (click)="close()">Cancelar</button>
        <button class="btn btn-primary" (click)="save()">Guardar</button>
      </div>

    </form>
  </dialog>
  `
})
export class ProyectoCreateModal {

  private store = inject(ProyectosStore);

  name = '';
  clienteId!: number;
  contactoId?: number;

  open() {
    (document.querySelector('dialog') as HTMLDialogElement)?.showModal();
  }

  close() {
    (document.querySelector('dialog') as HTMLDialogElement)?.close();
  }

  async save() {
    await this.store.create({
      name: this.name,
      clienteId: Number(this.clienteId),
      contactoId: this.contactoId,
    });

    this.close();
  }
}
