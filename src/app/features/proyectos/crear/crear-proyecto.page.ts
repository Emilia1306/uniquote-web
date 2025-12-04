import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProyectosStore } from '../data/proyectos.store';

@Component({
  standalone: true,
  selector: 'proyecto-create',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="max-w-[600px] mx-auto px-6 py-8">

    <h1 class="text-3xl font-semibold mb-6">Crear Proyecto</h1>

    <div class="card p-6 space-y-4">

      <!-- Nombre -->
      <div>
        <label class="block font-medium mb-1">Nombre del proyecto</label>
        <input type="text" class="input w-full"
               [(ngModel)]="name"
               placeholder="Ej. Estudio XYZ" />
      </div>

      <!-- Cliente ID -->
      <div>
        <label class="block font-medium mb-1">Cliente ID</label>
        <input type="number" class="input w-full"
               [(ngModel)]="clienteId"
               placeholder="Ej. 5" />
      </div>

      <!-- Contacto ID opcional -->
      <div>
        <label class="block font-medium mb-1">Contacto ID (opcional)</label>
        <input type="number" class="input w-full"
               [(ngModel)]="contactoId"
               placeholder="Ej. 12" />
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 mt-6">
        <button class="btn" (click)="cancelar()">Cancelar</button>
        <button class="btn btn-primary" (click)="guardar()">Guardar</button>
      </div>

    </div>

  </div>
  `
})
export class ProyectoCreatePage {

  private router = inject(Router);
  private store = inject(ProyectosStore);

  name = '';
  clienteId: number | null = null;
  contactoId: number | null = null;

  async guardar() {
    console.log("GUARDANDO...", this.name, this.clienteId, this.contactoId);

    if (!this.name.trim()) {
      alert('Debe ingresar un nombre.');
      return;
    }

    if (!this.clienteId) {
      alert('Debe ingresar un clienteId.');
      return;
    }

    try {
      const result = await this.store.create({
        name: this.name,
        clienteId: Number(this.clienteId),
        contactoId: this.contactoId || undefined
      });

      console.log("RESULTADO CREATE:", result);

      // 👉 Ruta REAL según tu routing actual
      this.router.navigate(['/gerente/proyectos']);

    } catch (err: any) {
      console.error("ERROR AL CREAR PROYECTO:", err);
      alert("Error al crear el proyecto: " + (err.error?.message || err.message));
    }
  }

  cancelar() {
    this.router.navigate(['/gerente/proyectos']);
  }
}
