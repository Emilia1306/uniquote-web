import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProyectosStore } from './data/proyectos.store';
import { Proyecto } from './data/proyectos.types';

import { ProyectosCardsComponent } from './ui/proyectos-cards.component';
import { ProyectosTableComponent } from './ui/proyectos-table.component';
import { UiComboboxComponent, UiComboboxItem } from '../../shared/ui/ui-combobox/ui-combobox.component';

import { ClientesApi } from '../clientes/data/clientes.api';
import { ContactosApi } from '../clientes/data/contactos.api';
import { AuthService } from '../../core/auth/auth.service';

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
  private route = inject(ActivatedRoute);
  private clientesApi = inject(ClientesApi);
  private contactosApi = inject(ContactosApi);
  auth = inject(AuthService);

  // Estado
  searchText = signal('');
  view = signal<'cards' | 'table'>((localStorage.getItem('proyectos-view-mode') as 'cards' | 'table') || 'table');

  toggleView() {
    const newVal = this.view() === 'cards' ? 'table' : 'cards';
    this.view.set(newVal);
    localStorage.setItem('proyectos-view-mode', newVal);
  }

  // CREAR
  modalName = '';
  modalClienteId: number | null = null;
  modalContactoId: number | null = null;

  // Listas para comboboxes
  clientesItems = signal<UiComboboxItem[]>([]);
  contactosItems = signal<UiComboboxItem[]>([]);

  // Contexto de cliente (si estamos viendo el historial de un cliente especifico)
  clienteId = signal<number | null>(null);
  clienteName = signal<string>(''); // Nuevo signal para el nombre

  // EDITAR
  editId: number | null = null;
  editName = '';
  editClienteId: number | null = null;
  editContactoId: number | null = null;

  // Read-only display fields
  editClienteName = '';
  editContactoName = '';

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const cId = Number(id);
      this.clienteId.set(cId);
      await this.store.loadByCliente(cId);

      // Cargar info del cliente para el titulo
      try {
        const clientData = await this.clientesApi.getById(cId);
        if (clientData) {
          this.clienteName.set(clientData.empresa);
        }
      } catch (err) {
        console.error('Error cargando info de cliente', err);
      }

    } else {
      await this.store.loadAll();
    }
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
    this.modalClienteId = this.clienteId();
    this.modalContactoId = null;
    this.contactosItems.set([]);

    if (this.modalClienteId) {
      this.onClienteChange(this.modalClienteId);
    }

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

  async openEditModal(p: Proyecto) {
    this.editId = p.id;
    this.editName = p.name;
    this.editClienteId = p.cliente.id;
    this.editContactoId = p.contacto?.id ?? null;

    // Set display names
    this.editClienteName = p.cliente.empresa;
    this.editContactoName = p.contacto?.nombre || 'Sin contacto';

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

    // Reload to get fresh data with all relations
    await this.store.loadAll();

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
    const role = this.auth.role();
    let prefix = '/gerente';
    if (role === 'ADMIN') prefix = '/admin';
    if (role === 'DIRECTOR') prefix = '/director';

    this.router.navigate([`${prefix}/proyectos`, id]);
  }
}
