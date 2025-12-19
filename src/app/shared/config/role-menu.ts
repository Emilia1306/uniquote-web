export type MenuItem = { label: string; path: string; icon: string };

export const ROLE_MENU = {
  ADMIN: [
    { label: 'Inicio', path: '/admin', icon: 'house' },
    { label: 'Proyectos', path: '/admin/proyectos', icon: 'folder-kanban' },
    { label: 'Cotizaciones', path: '/admin/cotizaciones', icon: 'file-text' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: 'users' },
    { label: 'Clientes', path: '/admin/clientes', icon: 'users' },
    { label: 'Tarifario', path: '/admin/tarifario', icon: 'ticket' },
    { label: 'Auditoría', path: '/admin/auditoria', icon: 'history' },
  ],

  GERENTE: [
    { label: 'Inicio', path: '/gerente', icon: 'house' },
    { label: 'Proyectos', path: '/gerente/proyectos', icon: 'file-text' },
    { label: 'Cotizaciones', path: '/gerente/cotizaciones', icon: 'file-text' },
    { label: 'Estadísticas de Equipo', path: '/gerente/estadisticas-equipo', icon: 'users' },
    { label: 'Clientes', path: '/gerente/clientes', icon: 'building-2' },
  ],

  DIRECTOR: [
    { label: 'Inicio', path: '/director', icon: 'house' },
    { label: 'Proyectos', path: '/director/proyectos', icon: 'folder-kanban' },
    { label: 'Cotizaciones', path: '/director/cotizaciones', icon: 'file-text' },
    { label: 'Clientes', path: '/director/clientes', icon: 'building-2' },
  ],
} as const;
