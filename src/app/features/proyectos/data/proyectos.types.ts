export interface Proyecto {
  id: number;
  name: string;

  cliente: {
    id: number;
    empresa: string;
    razonSocial: string;
  };

  contacto?: {
    id: number;
    nombre: string;
    email: string;
  };

  createdBy: {
    id: number;
    name: string;
    lastName: string;
  };

  createdAt: string;
  updatedAt: string;

  _count: {
    cotizaciones: number;
  };
}
