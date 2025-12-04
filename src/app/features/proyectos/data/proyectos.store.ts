import { Injectable, signal, computed, inject } from '@angular/core';
import { ProyectosApi, Proyecto } from './proyectos.api';

@Injectable({ providedIn: 'root' })
export class ProyectosStore {

  private api = inject(ProyectosApi);

  private _list = signal<Proyecto[]>([]);
  private _loading = signal<boolean>(false);

  list = computed(() => this._list());
  loading = computed(() => this._loading());

  async loadByCliente(clienteId: number) {
    this._loading.set(true);
    const res = await this.api.getByCliente(clienteId).toPromise();
    this._list.set(res ?? []);
    this._loading.set(false);
  }
  async create(data: { name: string; clienteId: number; contactoId?: number }) {
    const result: any = await this.api.create(data).toPromise();

    // agregarlo al listado sin recargar la página
    this._list.update(prev => [...prev, result]);

    return result;
  }
}
