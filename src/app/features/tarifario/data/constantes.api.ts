import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Constante {
    id: number;
    categoria: string;
    subcategoria: string;
    valor: number;
    unidad: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateConstanteDto {
    categoria: string;
    subcategoria: string;
    valor: number;
    unidad: string;
}

export interface UpdateConstanteDto {
    categoria?: string;
    subcategoria?: string;
    valor?: number;
    unidad?: string;
}

@Injectable({ providedIn: 'root' })
export class ConstantesApi {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/constantes`;

    findAll(): Observable<Constante[]> {
        return this.http.get<Constante[]>(this.base);
    }

    findOne(id: number): Observable<Constante> {
        return this.http.get<Constante>(`${this.base}/${id}`);
    }

    findByCategoria(nombre: string): Observable<Constante[]> {
        return this.http.get<Constante[]>(`${this.base}/categoria/${encodeURIComponent(nombre)}`);
    }

    findBySubcategoria(nombre: string): Observable<Constante[]> {
        return this.http.get<Constante[]>(`${this.base}/subcategoria/${encodeURIComponent(nombre)}`);
    }

    create(dto: CreateConstanteDto): Observable<Constante> {
        return this.http.post<Constante>(this.base, dto);
    }

    update(id: number, dto: UpdateConstanteDto): Observable<Constante> {
        return this.http.patch<Constante>(`${this.base}/${id}`, dto);
    }

    remove(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.base}/${id}`);
    }
}
