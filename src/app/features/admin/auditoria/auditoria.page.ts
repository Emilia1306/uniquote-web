import { Component, inject, signal, computed } from '@angular/core';
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

    // Pagination computed
    totalPages = computed(() => this.meta()?.lastPage || 1);
    hasPrev = computed(() => (this.meta()?.page || 1) > 1);
    hasNext = computed(() => (this.meta()?.page || 1) < this.totalPages());

    pagesArray = computed(() => {
        const total = this.totalPages();
        // Generate array [0, 1, 2... total-1]
        // Note: The API uses 1-based indexing for 'page', so we map accordingly in the template (i+1)
        // However, if we want strict page numbers, let's just generate an array of numbers.
        // Let's stick to 0-indexed for the loop to match Users implementation if that's what was used.
        // In Users page: i of pagesArray() (0..N-1), display {{ i + 1 }}.
        return Array.from({ length: total }, (_, i) => i);
    });

    currentPage = 1;

    ngOnInit() {
        this.loadData();
    }

    async loadData(page = 1) {
        this.currentPage = page;
        this.loading.set(true);
        this.error.set(null);
        try {
            const res = await this.api.list({ page, limit: 10 });
            this.logs.set(res.data);
            this.meta.set(res.meta);
        } catch (e: any) {
            this.error.set(e?.message ?? 'Error al cargar auditoría');
        } finally {
            this.loading.set(false);
        }
    }

    changePage(newPage: number) {
        if (newPage >= 1 && newPage <= this.totalPages()) {
            this.loadData(newPage);
        }
    }

    prevPage() {
        if (this.hasPrev()) this.changePage(this.currentPage - 1);
    }

    nextPage() {
        if (this.hasNext()) this.changePage(this.currentPage + 1);
    }

    goPage(i: number) {
        // i is 0-indexed from the template loop
        this.changePage(i + 1);
    }
}
