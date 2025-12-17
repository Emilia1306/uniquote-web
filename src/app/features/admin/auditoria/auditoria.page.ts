import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { AuditoriaApi, LogAuditoria } from '../data/auditoria.api';

@Component({
    selector: 'app-auditoria',
    standalone: true,
    imports: [NgFor, NgIf, DatePipe],
    templateUrl: './auditoria.page.html'
})
export class AuditoriaPage {
    private api = inject(AuditoriaApi);

    logs = signal<LogAuditoria[]>([]);
    meta = signal<any>(null);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    currentPage = 1;

    ngOnInit() {
        this.loadData();
    }

    async loadData(page = 1) {
        this.currentPage = page;
        this.loading.set(true);
        this.error.set(null);
        try {
            const res = await this.api.list({ page, limit: 20 });
            this.logs.set(res.data);
            this.meta.set(res.meta);
        } catch (e: any) {
            this.error.set(e?.message ?? 'Error al cargar auditoría');
        } finally {
            this.loading.set(false);
        }
    }

    changePage(newPage: number) {
        this.loadData(newPage);
    }
}
