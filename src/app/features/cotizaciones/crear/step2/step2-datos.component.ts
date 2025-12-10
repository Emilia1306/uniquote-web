import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CotizacionWizardStore } from '../wizard.store';

import { ClientesApi, Cliente } from '../../../clientes/data/clientes.api';
import { ContactosApi, ContactoEmpresa } from '../../../clientes/data/contactos.api';
import { ProyectosApi } from '../../../proyectos/data/proyectos.api';
import { Proyecto } from '../../../proyectos/data/proyectos.types';

@Component({
  standalone: true,
  selector: 'step2-datos',
  imports: [CommonModule, FormsModule],
  templateUrl: './step2-datos.component.html',
  styleUrls: ['./step2-datos.component.scss']
})
export class Step2DatosComponent implements OnInit {

  store = inject(CotizacionWizardStore);

  // APIs
  clientesApi = inject(ClientesApi);
  contactosApi = inject(ContactosApi);
  proyectosApi = inject(ProyectosApi);

  // Datos UI
  clientes: Cliente[] = [];
  contactosFiltrados: ContactoEmpresa[] = [];
  proyectosFiltrados: Proyecto[] = [];

  clienteIdSeleccionado: number | null = null;

  d = this.store.data();

  async ngOnInit() {
    // CARGAR CLIENTES AL ENTRAR AL PASO
    const res = await this.clientesApi.list({ pageSize: 200 }, 'auto');
    this.clientes = res.items;
  }

  // ============================================================
  // CUANDO CAMBIA EL CLIENTE
  // ============================================================
  async onClienteChange(clienteId: string | number) {
    const id = Number(clienteId);
    this.clienteIdSeleccionado = id;

    // Reset dependientes
    this.store.patch({
      contactoId: null,
      projectId: null
    });

    // CONTACTOS
    this.contactosFiltrados =
      (await this.contactosApi.listByCliente(id)) ?? [];

    // PROYECTOS (Observable → Promise, con fallback a [])
    this.proyectosFiltrados =
      (await firstValueFrom(this.proyectosApi.getByCliente(id))) ?? [];
  }


  patch() {
    this.store.patch({ ...this.d });
  }
}
