import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CotizacionWizardStore, WizardData } from '../wizard.store';
import { ClientesApi } from '../../../clientes/data/clientes.api';
import { ContactosApi } from '../../../clientes/data/contactos.api';
import { ProyectosApi } from '../../../proyectos/data/proyectos.api';

import {
  UiComboboxComponent,
  UiComboboxItem,
} from '../../../../shared/ui/ui-combobox/ui-combobox.component';
import {
  UiSelectComponent,
  UiSelectItem,
} from '../../../../shared/ui/ui-select/ui-select.component';

import { ModalCrearClienteComponent } from '../../../../shared/ui/modals/modal-crear-client/modal-crear-cliente.component';
import { ModalCrearContactoComponent } from '../../../../shared/ui/modals/modal-crear-contacto/modal-crear-contacto.component';
import { ModalCrearProyectoComponent } from '../../../../shared/ui/modals/modal-crear-proyecto/modal-crear-proyecto.component';

@Component({
  standalone: true,
  selector: 'step2-datos',
  imports: [
    CommonModule,
    FormsModule,
    UiComboboxComponent,
    UiSelectComponent,
    ModalCrearClienteComponent,
    ModalCrearContactoComponent,
    ModalCrearProyectoComponent,
  ],
  templateUrl: './step2-datos.component.html',
  styleUrls: ['./step2-datos.component.scss'],
})
export class Step2DatosComponent implements OnInit {
  // STORE
  store = inject(CotizacionWizardStore);

  // Alias reactivo al store (SIEMPRE lee el valor actual)
  get d(): WizardData {
    return this.store.data();
  }

  // APIs
  clientesApi = inject(ClientesApi);
  contactosApi = inject(ContactosApi);
  proyectosApi = inject(ProyectosApi);

  // Modales
  @ViewChild('modalCliente') modalCliente!: ModalCrearClienteComponent;
  @ViewChild('modalContacto') modalContacto!: ModalCrearContactoComponent;
  @ViewChild('modalProyecto') modalProyecto!: ModalCrearProyectoComponent;

  // Datos crudos
  clientes: any[] = [];
  contactosFiltrados: any[] = [];
  proyectosFiltrados: any[] = [];

  // Items para combos
  clientesItems: UiComboboxItem[] = [];
  contactosItems: UiComboboxItem[] = [];
  proyectosItems: UiComboboxItem[] = [];

  // Selecciones UI (no el store)
  clienteIdSeleccionado: number | null = null;
  contactoSeleccionado: number | null = null;
  proyectoSeleccionado: number | null = null;

  // Selects de cobertura, metodología y penetración
  coberturaItems: UiSelectItem[] = [
    { value: 'AMSS', label: 'AMSS' },
    { value: 'Nacional', label: 'Nacional' },
    { value: 'Urbano', label: 'Urbano' },
    { value: 'Ciudades Principales', label: 'Ciudades Principales' },
    { value: 'Cede UNIMER', label: 'Cede UNIMER' },
    { value: 'Custom', label: 'Custom' },
  ];

  metodologiaItems: UiSelectItem[] = [
    { value: 'Casa por casa', label: 'Casa por casa' },
    { value: 'Punto de afluencia', label: 'Punto de afluencia' },
  ];

  penetracionItems: UiSelectItem[] = [
    { value: 1, label: 'Fácil' },
    { value: 0.50, label: 'Normal' },
    { value: 0.20, label: 'Difícil' },
    { value: 'custom', label: 'Personalizada' },
  ];

  penetracionSeleccionada: any = null;

  constructor() {
    // Escuchar cambios en el store para inicializar penetracion si no está seteada
    // (O hacerlo en ngOnInit)
  }

  // ============================================================
  // INIT
  // ============================================================
  async ngOnInit() {
    console.log('Step2DatosComponent: ngOnInit START');
    await this.cargarClientes();

    const current = this.store.data();
    console.log('Step2DatosComponent: Store Data:', current);

    // 🔥 PRE-FILL FROM STORE
    if (current.projectId) {
      console.log('Step2DatosComponent: Has projectId', current.projectId);
      try {
        const project: any = await firstValueFrom(this.proyectosApi.getOne(current.projectId));
        console.log('Step2DatosComponent: Fetched Project:', project);

        // Fallback: check project.clienteId directly OR project.cliente.id
        const cId = project.clienteId ?? project.cliente?.id;

        if (project && cId) {
          console.log('Step2DatosComponent: Found clienteId', cId);
          this.clienteIdSeleccionado = cId;

          // Cargar dependientes (contactos y proyectos del cliente)
          console.log('Step2DatosComponent: Loading dependents...');
          // Pass false to NOT reset selections
          await this.onClienteChange(this.clienteIdSeleccionado, false);
          console.log('Step2DatosComponent: Dependents loaded.');

          // Setear proyecto y contacto
          this.proyectoSeleccionado = current.projectId;
          this.contactoSeleccionado = current.contactoId;

          console.log('Step2DatosComponent: Setting selections:', {
            proyecto: this.proyectoSeleccionado,
            contacto: this.contactoSeleccionado
          });

          // Actualizar labels en local
          this.patchProyecto();
          this.patchContacto();
        } else {
          console.error('Step2DatosComponent: MISSING clienteId in project response!', project);
        }
      } catch (e) {
        console.error('Error pre-filling wizard step 2', e);
      }
    } else {
      console.warn('Step2DatosComponent: No projectId in store initially.');
    }

    // Penetración
    if (current.penetracionCategoria) {
      const val = current.penetracionCategoria;
      const exists = this.penetracionItems.find(i => i.value === val);
      if (exists) {
        this.penetracionSeleccionada = val;
      } else {
        this.penetracionSeleccionada = 'custom';
      }
    }
    console.log('Step2DatosComponent: ngOnInit END');
  }

  async cargarClientes() {
    const res = await this.clientesApi.list({ pageSize: 200 }, 'auto');
    this.clientes = res.items;

    this.clientesItems = this.clientes.map((c) => ({
      value: c.id,
      label: c.empresa,
    }));
  }

  // ============================================================
  // CAMBIO DE CLIENTE
  // ============================================================
  async onClienteChange(clienteId: number | null, resetSelections = true) {
    if (!clienteId) {
      this.clienteIdSeleccionado = null;

      this.contactoSeleccionado = null;
      this.proyectoSeleccionado = null;

      this.contactosFiltrados = [];
      this.proyectosFiltrados = [];

      this.contactosItems = [];
      this.proyectosItems = [];

      this.store.patch({
        contactoId: null,
        projectId: null,
      });

      return;
    }

    this.clienteIdSeleccionado = clienteId;

    if (resetSelections) {
      this.contactoSeleccionado = null;
      this.proyectoSeleccionado = null;

      this.store.patch({
        contactoId: null,
        projectId: null,
      });
    }

    this.contactosFiltrados = await this.contactosApi.listByCliente(clienteId);
    this.contactosItems = this.contactosFiltrados.map((ct) => ({
      value: ct.id,
      label: ct.nombre,
    }));

    const proyectos = await firstValueFrom(
      this.proyectosApi.getByCliente(clienteId),
    );
    this.proyectosFiltrados = proyectos ?? [];
    this.proyectosItems = this.proyectosFiltrados.map((p) => ({
      value: p.id,
      label: p.name,
    }));

    // Save Client Name
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (cliente) {
      this.store.patch({ clientName: cliente.empresa });
    }
  }

  // ============================================================
  // PATCH CONTACTO / PROYECTO
  // ============================================================
  patchContacto() {
    const contacto = this.contactosFiltrados.find(c => c.id === this.contactoSeleccionado);
    this.patch({
      contactoId: this.contactoSeleccionado,
      contactName: contacto ? contacto.nombre : ''
    });
  }

  patchProyecto() {
    const proyecto = this.proyectosFiltrados.find(p => p.id === this.proyectoSeleccionado);
    this.patch({
      projectId: this.proyectoSeleccionado,
      projectName: proyecto ? proyecto.name : ''
    });
  }

  // ============================================================
  // CREAR DESDE MODALES
  // ============================================================
  async crearCliente(data: any) {
    const nuevo = await this.clientesApi.create(data);
    await this.cargarClientes();

    const id = Number(nuevo.id);
    this.clienteIdSeleccionado = id;

    await this.onClienteChange(id);
    this.modalCliente.hide();
  }

  async crearContacto(data: any) {
    try {
      const nuevo = await this.contactosApi.create(data);

      this.contactosFiltrados.push(nuevo);
      this.contactosItems = this.contactosFiltrados.map((ct) => ({
        value: ct.id,
        label: ct.nombre,
      }));

      this.contactoSeleccionado = nuevo.id;
      this.patchContacto();

      this.modalContacto.hide();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      const message = error?.error?.message || error?.message || 'Error al crear el contacto';
      alert(`Error al crear contacto: ${message}`);
    }
  }

  async crearProyecto(data: any) {
    try {
      const nuevo = await firstValueFrom(this.proyectosApi.create(data));

      this.proyectosFiltrados.push(nuevo);
      this.proyectosItems = this.proyectosFiltrados.map((p) => ({
        value: p.id,
        label: p.name,
      }));

      this.proyectoSeleccionado = nuevo.id;
      this.patchProyecto();

      this.modalProyecto.hide();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error al crear el proyecto');
    }
  }

  // ============================================================
  // PENETRACIÓN PERSONALIZADA
  // ============================================================
  onPenetracionChange(value: any) {
    this.penetracionSeleccionada = value;

    if (value !== 'custom') {
      this.patch({ penetracionCategoria: value as number });
    } else {
      this.patch({ penetracionCategoria: null });
    }
  }

  // ============================================================
  // TRABAJO DE CAMPO
  // ============================================================
  onToggleTrabajoDeCampo(realiza: boolean) {
    const current = this.store.data();

    this.patch({
      trabajoDeCampoRealiza: realiza,
      trabajoDeCampoTipo: realiza ? current.trabajoDeCampoTipo : null,
      trabajoDeCampoCosto: realiza ? current.trabajoDeCampoCosto : null,
      encuestadoresTotales: realiza ? current.encuestadoresTotales : null,
      supervisores: realiza ? current.supervisores : null,
      incentivoTotal: realiza ? current.incentivoTotal : null,
    });
  }

  onChangeTipoTrabajo(tipo: 'propio' | 'subcontratado') {
    this.patch({ trabajoDeCampoTipo: tipo });

    if (tipo === 'propio') {
      // se limpia costo de subcontratación
      this.patch({ trabajoDeCampoCosto: null });
    } else {
      // se limpian datos operativos
      this.patch({
        encuestadoresTotales: null,
        supervisores: null,
      });
    }
  }

  // ============================================================
  // CHANGE HANDLERS FOR LABELS
  // ============================================================
  onCoberturaChange(val: string) {
    const item = this.coberturaItems.find(i => i.value === val);
    this.patch({
      cobertura: val,
      coberturaLabel: item ? item.label : val
    });
  }

  onMetodologiaChange(val: string) {
    const item = this.metodologiaItems.find(i => i.value === val);
    this.patch({
      metodologia: val,
      metodologiaLabel: item ? item.label : val
    });
  }

  // ============================================================
  // PATCH GENERAL
  // ============================================================
  patch(values: Partial<WizardData>) {
    this.store.patch(values);
  }
}
