import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProyectosStore } from './data/proyectos.store';
import { Proyecto } from './data/proyectos.types';

import { ProyectosCardsComponent } from './ui/proyectos-cards.component';
import { ProyectosTableComponent } from './ui/proyectos-table.component';

@Component({
  selector: 'proyectos-browse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProyectosCardsComponent,
    ProyectosTableComponent,
  ],
  templateUrl: './proyectos-browse.page.html'
})
export class ProyectosBrowsePage {

  private store = inject(ProyectosStore);
  private router = inject(Router);

  // Estado
  searchText = signal('');
  view = signal<'cards' | 'table'>('table');

  // CREAR
  modalName = '';
  modalClienteId: number | null = null;
  modalContactoId: number | null = null;

  // EDITAR
  editId: number | null = null;
  editName = '';
  editClienteId: number | null = null;
  editContactoId: number | null = null;

  async ngOnInit() {
    await this.store.loadAll();
  }

  filteredList = computed(() => {
    const text = this.searchText().toLowerCase();

    return this.store.list().filter(p =>
      p.name.toLowerCase().includes(text) ||
      p.cliente.empresa.toLowerCase().includes(text) ||
      p.cliente.razonSocial.toLowerCase().includes(text) ||
      p.contacto?.nombre?.toLowerCase().includes(text) ||
      p.contacto?.email?.toLowerCase().includes(text) ||
      `${p.createdBy.name} ${p.createdBy.lastName}`.toLowerCase().includes(text)
    );
  });

  // ------------------------------------------------------
  // CREAR PROYECTO
  // ------------------------------------------------------

  openCreateModal() {
    (document.getElementById('modal-create') as HTMLDialogElement).showModal();
  }

  closeCreateModal() {
    (document.getElementById('modal-create') as HTMLDialogElement).close();
  }

  async crearProyecto() {
    if (!this.modalName.trim() || !this.modalClienteId) {
      alert('Debe rellenar nombre y cliente ID');
      return;
    }

    await this.store.create({
      name: this.modalName,
      clienteId: Number(this.modalClienteId),
      contactoId: this.modalContactoId || undefined
    });

    this.closeCreateModal();
  }

  // ------------------------------------------------------
  // EDITAR PROYECTO
  // ------------------------------------------------------

  openEditModal(p: Proyecto) {
    this.editId = p.id;
    this.editName = p.name;
    this.editClienteId = p.cliente.id;
    this.editContactoId = p.contacto?.id ?? null;

    (document.getElementById('modal-edit') as HTMLDialogElement).showModal();
  }

  closeEditModal() {
    (document.getElementById('modal-edit') as HTMLDialogElement).close();
  }

  async guardarCambios() {
    if (!this.editId) return;

    await this.store.update(this.editId, {
      name: this.editName,
      clienteId: this.editClienteId!,
      contactoId: this.editContactoId || undefined
    });

    this.closeEditModal();
  }

  // ------------------------------------------------------
  // ELIMINAR PROYECTO
  // ------------------------------------------------------

  async eliminarProyecto(p: Proyecto) {
    if (p._count.cotizaciones > 0) {
      alert("No se puede eliminar un proyecto que tiene cotizaciones.");
      return;
    }

    const ok = confirm(`¿Eliminar el proyecto "${p.name}"?`);
    if (!ok) return;

    await this.store.delete(p.id);
  }

  // ------------------------------------------------------
  // VER DETALLE
  // ------------------------------------------------------

  verDetalle(id: number) {
    this.router.navigate(['/gerente/proyectos', id]);
  }
}
