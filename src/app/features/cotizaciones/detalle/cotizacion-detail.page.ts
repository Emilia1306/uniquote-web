import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionesApi } from '../data/cotizaciones.api';
import { CotizacionStatusPillComponent } from './cotizacion-status-pill.component';
import { CotizacionItemsTableComponent } from './cotizacion-items-table.component';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'cotizacion-detail',
  imports: [CommonModule, CotizacionStatusPillComponent, CotizacionItemsTableComponent],
  templateUrl: './cotizacion-detail.page.html'
})
export class CotizacionDetailPage {

  api = inject(CotizacionesApi);
  route = inject(ActivatedRoute);
  router = inject(Router);
  auth = inject(AuthService);

  cotizacion: any = null;
  loading = true;

  get canEdit() {
    if (!this.cotizacion) return false;
    const isAdmin = this.auth.role() === 'ADMIN';
    const isOwner = this.cotizacion.createdBy?.id === this.auth.user()?.id;
    return isAdmin || isOwner;
  }

  get canDelete() {
    return this.auth.role() === 'ADMIN';
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  async load(id: number) {
    this.loading = true;

    try {
      this.cotizacion = await this.api.getById(id).toPromise();
    } catch (err) {
      console.error(err);
    }

    this.loading = false;
  }

  editar() {
    this.router.navigate(['/cotizaciones/editar', this.cotizacion.id]);
  }

  async clonar() {
    const clone = await this.api.clone(this.cotizacion.id).toPromise();

    if (!clone) {
      console.error('Error: clone es undefined');
      return;
    }

    this.router.navigate(['/cotizaciones', clone.id]);
  }


  async eliminar() {
    if (!confirm('¿Seguro que deseas eliminar esta cotización?')) return;
    await this.api.delete(this.cotizacion.id).toPromise();
    this.router.navigate(['/cotizaciones']);
  }

}
