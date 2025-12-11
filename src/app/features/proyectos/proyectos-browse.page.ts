import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProyectosStore } from './data/proyectos.store';
import { Proyecto } from './data/proyectos.types';

import { ProyectosCardsComponent } from './ui/proyectos-cards.component';
import { ProyectosTableComponent } from './ui/proyectos-table.component';
import { UiComboboxComponent, UiComboboxItem } from '../../shared/ui/ui-combobox/ui-combobox.component';

import { ClientesApi } from '../clientes/data/clientes.api';
import { ContactosApi } from '../clientes/data/contactos.api';

@Component({
  selector: 'proyectos-browse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProyectosCardsComponent,
    ProyectosTableComponent,
    UiComboboxComponent,
    LucideAngularModule
  ],
  templateUrl: './proyectos-browse.page.html'
})
export class ProyectosBrowsePage {

  private store = inject(ProyectosStore);
  private router = inject(Router);
  private clientesApi = inject(ClientesApi);
  private contactosApi = inject(ContactosApi);

  // Estado
  searchText = signal('');
  view = signal<'cards' | 'table'>('table');

  // CREAR
  modalName = '';
  modalClienteId: number | null = null;
  modalContactoId: number | null = null;

  // Listas para comboboxes
  clientesItems = signal<UiComboboxItem[]>([]);
  contactosItems = signal<UiComboboxItem[]>([]);

  // EDITAR
  editId: number | null = null;
  editName = '';
  editClienteId: number | null = null;
  editContactoId: number | null = null;

  async ngOnInit() {
    await this.store.loadAll();
    await this.loadClientes();
  }

  async loadClientes() {
    try {
      const res = await this.clientesApi.list({ sort: 'empresa_asc', pageSize: 1000 }, 'auto');
      const items = res.items.map(c => ({
        value: c.id,
        label: c.empresa
      }));
      this.clientesItems.set(items);
    } catch (err) {
      console.error('Error cargando clientes', err);
    }
  }

  async onClienteChange(clienteId: number | null) {
    this.modalClienteId = clienteId;
    this.modalContactoId = null; // Reset contacto
    this.contactosItems.set([]);

    if (clienteId) {
      try {
        const contactos = await this.contactosApi.listByCliente(clienteId);
        const items = contactos.map(c => ({
          value: c.id,
          label: c.nombre
        }));
        this.contactosItems.set(items);
      } catch (err) {
        console.error('Error cargando contactos', err);
      }
    }
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
    this.modalName = '';
    this.modalClienteId = null;
    this.modalContactoId = null;
    this.contactosItems.set([]);
    (document.getElementById('modal-create') as HTMLDialogElement).showModal();
  }

  closeCreateModal() {
    (document.getElementById('modal-create') as HTMLDialogElement).close();
  }

  async crearProyecto() {
    if (!this.modalName.trim() || !this.modalClienteId) {
      alert('Debe rellenar nombre y cliente');
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
