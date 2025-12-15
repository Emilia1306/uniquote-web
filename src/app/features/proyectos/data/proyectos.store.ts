import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProyectosApi } from './proyectos.api';
import { Proyecto } from './proyectos.types';

@Injectable({ providedIn: 'root' })
export class ProyectosStore {
  private api = inject(ProyectosApi);

  private _list = signal<Proyecto[]>([]);
  private _loading = signal<boolean>(false);

  list = computed(() => this._list());
  loading = computed(() => this._loading());

  /** Cargar todos */
  async loadAll() {
    this._loading.set(true);
    const res = await firstValueFrom(this.api.getAll());
    this._list.set(res);
    this._loading.set(false);
  }

  /** Cargar por cliente */
  async loadByCliente(clienteId: number) {
    this._loading.set(true);
    const res = await firstValueFrom(this.api.listByCliente(clienteId));
    this._list.set(res);
    this._loading.set(false);
  }

  /** Crear */
  async create(data: { name: string; clienteId: number; contactoId?: number }) {
    const result = await firstValueFrom(this.api.create(data));
    this._list.update(prev => [...prev, result]);
    return result;
  }

  /** Editar */
  async update(id: number, data: { name: string; clienteId: number; contactoId?: number }) {
    const result = await firstValueFrom(this.api.update(id, data));

    this._list.update(prev =>
      prev.map(p => (p.id === id ? result : p))
    );

    return result;
  }

  /** Eliminar */
  async delete(id: number) {
    await firstValueFrom(this.api.delete(id));

    this._list.update(prev => prev.filter(p => p.id !== id));
  }
}
