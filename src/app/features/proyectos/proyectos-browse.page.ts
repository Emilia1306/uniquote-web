import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import Swal from 'sweetalert2';

import { ProyectosStore } from './data/proyectos.store';
import { Proyecto } from './data/proyectos.types';

import { ProyectosCardsComponent } from './ui/proyectos-cards.component';
import { ProyectosTableComponent } from './ui/proyectos-table.component';
import { UiComboboxComponent, UiComboboxItem } from '../../shared/ui/ui-combobox/ui-combobox.component';
import { UiPaginationComponent } from '../../shared/ui/ui-pagination/ui-pagination.component';
import { UiSkeletonComponent } from '../../shared/ui/ui-skeleton/ui-skeleton.component';

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
    LucideAngularModule,
    UiPaginationComponent,
    UiSkeletonComponent
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
  loading = this.store.loading;
  view = signal<'cards' | 'table'>((localStorage.getItem('proyectos-view-mode') as 'cards' | 'table') || 'table');

  // Pagination
  currentPage = signal<number>(1);
  itemsPerPage = 10;

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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del cliente',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
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
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudieron cargar los clientes. Por favor intente más tarde.',
        confirmButtonColor: 'var(--brand)'
      });
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los contactos del cliente seleccionado',
          toast: true,
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false
        });
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

  // Paginated list
  paginatedList = computed(() => {
    const allProjects = this.filteredList();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return allProjects.slice(start, end);
  });

  // Total pages
  totalPages = computed(() => {
    return Math.ceil(this.filteredList().length / this.itemsPerPage);
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
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Debe rellenar nombre y cliente',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: 'var(--brand)'
      });
      return;
    }

    await this.store.create({
      name: this.modalName,
      clienteId: Number(this.modalClienteId),
      contactoId: this.modalContactoId || undefined
    });

    this.closeCreateModal();

    Swal.fire({
      title: '¡Creado!',
      text: 'Proyecto creado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
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

    Swal.fire({
      title: '¡Actualizado!',
      text: 'Proyecto actualizado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  // ------------------------------------------------------
  // ELIMINAR PROYECTO
  // ------------------------------------------------------

  async eliminarProyecto(p: Proyecto) {
    if (p._count.cotizaciones > 0) {
      Swal.fire({
        title: 'No se puede eliminar',
        text: 'El proyecto tiene cotizaciones asociadas y no puede ser eliminado.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: 'var(--brand)'
      });
      return;
    }

    const res = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: `Se eliminará el proyecto "${p.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // red-500
      cancelButtonColor: '#71717a', // zinc-500
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (res.isConfirmed) {
      await this.store.delete(p.id);
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El proyecto ha sido eliminado.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
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
