import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionesApi } from '../data/cotizaciones.api';
import { CotizacionStatusPillComponent } from './cotizacion-status-pill.component';
import { CotizacionItemsTableComponent } from './cotizacion-items-table.component';

import { AuthService } from '../../../core/auth/auth.service';

import { STATUS_COLORS } from '../ui/status-colors';
@Component({
  standalone: true,
  selector: 'cotizacion-detail',
  imports: [CommonModule, FormsModule, CotizacionStatusPillComponent, CotizacionItemsTableComponent],
  templateUrl: './cotizacion-detail.page.html',
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-scale-up { animation: scaleUp 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class CotizacionDetailPage {

  STATUS_COLORS = STATUS_COLORS;

  api = inject(CotizacionesApi);
  route = inject(ActivatedRoute);
  router = inject(Router);
  auth = inject(AuthService);

  cotizacion: any = null;
  loading = true;

  // Edit Item State
  editingItem: any = null;
  editForm = {
    personas: 0,
    dias: 0,
    costoUnitario: 0
  };

  get canEdit() {
    if (!this.cotizacion) return false;
    const role = this.auth.role();
    const isAdmin = role === 'ADMIN';
    const isGerente = role === 'GERENTE';
    const isOwner = this.cotizacion.createdBy?.id === this.auth.user()?.id;
    return isAdmin || isGerente || isOwner;
  }

  get canEditItems() {
    if (!this.cotizacion) return false;
    const role = this.auth.role();
    // User requested "only admin" for this part
    return role === 'ADMIN';
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

  // Item Editing
  openEdit(item: any) {
    this.editingItem = item;
    // Copy values to form
    this.editForm = {
      personas: Number(item.personas) || 0,
      dias: Number(item.dias) || 0,
      costoUnitario: Number(item.costoUnitario) || 0
    };
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
  }

  closeEdit() {
    this.editingItem = null;
    document.body.style.overflow = '';
  }

  async saveItem() {
    if (!this.editingItem || !this.cotizacion) return;

    try {
      await this.api.updateItem(this.cotizacion.id, this.editingItem.id, this.editForm).toPromise();
      await this.load(this.cotizacion.id); // Reload to get updated calculations
      this.closeEdit();
    } catch (err: any) {
      console.error('Error updating item:', err);
      const msg = err.error?.message || 'Error al actualizar el ítem';
      alert(msg);
    }
  }

}
