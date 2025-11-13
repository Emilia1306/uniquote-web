export type Role = 'ADMIN'|'GERENTE'|'DIRECTOR';

export function normalizeRole(r: unknown): Role {
  const s = String(r ?? '').toUpperCase();
  if (s.includes('ADMIN')) return 'ADMIN';
  if (s.includes('GERENTE')) return 'GERENTE';
  return 'DIRECTOR';
}

export function roleHome(r: Role): string {
  return r === 'ADMIN' ? '/admin' : r === 'GERENTE' ? '/gerente' : '/director';
}