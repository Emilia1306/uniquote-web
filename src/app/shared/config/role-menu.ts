import { Role } from '../../core/auth/roles';

export type MenuItem = { label: string; path: string; icon?: string };
export const ROLE_MENU: Record<Role, MenuItem[]> = {
  ADMIN: [
    { label: 'Inicio', path: '/admin', icon: 'lucideHouse' },
    { label: 'Cotizaciones', path: '/admin/cotizaciones', icon: 'lucideFileText' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: 'lucideUsers' },
    { label: 'Clientes', path: '/admin/cliente', icon: 'lucideUsers' },
    { label: 'Tarifario', path: '/admin/tarifario', icon: 'lucideTicket' },
    { label: 'Auditoría', path: '/admin/auditoria', icon: 'lucideHistory' },
  ],
  GERENTE: [
    { label: 'Inicio', path: '/gerente', icon: 'lucideHouse' },
    { label: 'Proyectos', path: '/gerente/proyectos', icon: 'lucideFileText' },
    { label: 'Cotizaciones', path: '/gerente/cotizaciones', icon: 'lucideFileText' },
    { label: 'Estadísticas', path: '/gerente/estadisticas', icon: 'lucideBarChart' },
    { label: 'Clientes', path: '/gerente/clientes', icon: 'lucideBuilding2' },
  ],
  DIRECTOR: [
    { label: 'Inicio', path: '/director', icon: 'lucideHouse' },
    { label: 'Mis Cotizaciones', path: '/director/cotizaciones', icon: 'lucideFolderOpen' },
    { label: 'Biblioteca Aprobadas', path: '/director/biblioteca', icon: 'lucideLibrary' },
    { label: 'Clientes', path: '/director/clientes', icon: 'lucideBuilding2' },
  ],
};
