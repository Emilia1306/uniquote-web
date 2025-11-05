import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

type Usuario = { nombre: string; correo: string; estado: 'Activo'|'Inactivo'; rol: string };
type LogAuditoria = { mensaje: string; hace: string };

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [NgFor],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent {
  usuarios: Usuario[] = [
    { nombre: 'Ana Gómez',  correo: 'ana@demo.com',  estado: 'Activo',  rol: 'Director' },
    { nombre: 'Luis Pérez', correo: 'luis@demo.com', estado: 'Activo',  rol: 'Gerente'  },
    { nombre: 'Eva Ruiz',   correo: 'eva@demo.com',  estado: 'Inactivo',rol: 'Director' },
    { nombre: 'Juan Arias', correo: 'juan@demo.com', estado: 'Activo',  rol: 'Director' },
    { nombre: 'Karla León', correo: 'karla@demo.com',estado: 'Activo',  rol: 'Director' },
  ];

  auditoria: LogAuditoria[] = [
    { mensaje: 'Editó cotización #104', hace: 'hace 2 h' },
    { mensaje: 'Aprobó cotización #101', hace: 'hace 5 h' },
    { mensaje: 'Actualizó tarifas de transporte', hace: 'ayer' },
  ];
}
