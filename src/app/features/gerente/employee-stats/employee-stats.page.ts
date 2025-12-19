import { Component, signal, inject, computed } from '@angular/core';
import { NgFor, NgIf, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionesApi } from '../../cotizaciones/data/cotizaciones.api';
import { firstValueFrom } from 'rxjs';

type EmployeeStat = {
    userId: number;
    name: string;
    lastName: string;
    total: number;
    enviados: number;
    aprobadas: number;
    noAprobadas: number;
    totalCobrar: number;
    ultimaCreadaAt: string | null;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

@Component({
    selector: 'employee-stats-page',
    standalone: true,
    imports: [NgFor, NgIf, DatePipe, CommonModule, FormsModule],
    templateUrl: './employee-stats.page.html',
})
export class EmployeeStatsPage {
    private cotizacionesApi = inject(CotizacionesApi);

    loading = signal<boolean>(true);
    employees = signal<EmployeeStat[]>([]);
    searchTerm = signal<string>('');
    pagination = signal<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    error = signal<string | null>(null);

    // Expose Math to template
    Math = Math;

    // Filtered employees based on search term
    filteredEmployees = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        const allEmployees = this.employees();

        if (!term) {
            return allEmployees;
        }

        return allEmployees.filter(emp =>
            emp.name.toLowerCase().includes(term) ||
            emp.lastName.toLowerCase().includes(term) ||
            `${emp.name} ${emp.lastName}`.toLowerCase().includes(term)
        );
    });

    async ngOnInit() {
        await this.loadEmployeeStats();
    }

    async loadEmployeeStats() {
        this.loading.set(true);
        this.error.set(null);

        try {
            console.log('Fetching employee stats...');
            const response = await firstValueFrom(
                this.cotizacionesApi.getUsersStatsSummary(
                    this.pagination().page,
                    this.pagination().limit
                )
            );

            console.log('Employee stats response:', response);

            // The API returns the data directly as an array
            if (Array.isArray(response)) {
                this.employees.set(response);
                // Update pagination based on array length
                this.pagination.update(p => ({
                    ...p,
                    total: response.length,
                    totalPages: Math.ceil(response.length / p.limit)
                }));
            } else {
                // Fallback if structure changes
                this.employees.set((response as any).data || []);
                this.pagination.set((response as any).pagination || this.pagination());
            }

            console.log('Employees set:', this.employees());
        } catch (err: any) {
            console.error('Error loading employee stats:', err);
            console.error('Error details:', err.message, err.status);
            this.error.set('Error al cargar las estadísticas de empleados: ' + (err.message || 'Error desconocido'));
        } finally {
            this.loading.set(false);
        }
    }

    async goToPage(page: number) {
        if (page < 1 || page > this.pagination().totalPages) return;

        this.pagination.update(p => ({ ...p, page }));
        await this.loadEmployeeStats();
    }

    async nextPage() {
        await this.goToPage(this.pagination().page + 1);
    }

    async prevPage() {
        await this.goToPage(this.pagination().page - 1);
    }

    formatNumber(value: number): string {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toString();
    }

    formatCurrency(value: number): string {
        if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(1) + 'K';
        }
        return '$' + value.toLocaleString('es-MX');
    }

    get pageNumbers(): number[] {
        const total = this.pagination().totalPages;
        const current = this.pagination().page;
        const pages: number[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            if (current <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push(-1); // ellipsis
                pages.push(total);
            } else if (current >= total - 3) {
                pages.push(1);
                pages.push(-1);
                for (let i = total - 4; i <= total; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push(-1);
                for (let i = current - 1; i <= current + 1; i++) pages.push(i);
                pages.push(-1);
                pages.push(total);
            }
        }

        return pages;
    }
}
