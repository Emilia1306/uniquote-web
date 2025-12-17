import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 py-4 mt-6 border-t border-zinc-100">
      
      <!-- Left: Counter (Mostrando X de Y) -->
      <div class="text-sm text-zinc-500 font-medium">
        Mostrando {{ rangeStart }} - {{ rangeEnd }} de {{ totalItems }}
      </div>

      <!-- Right: Navigation -->
      <div class="flex items-center gap-2">
        
        <!-- Anterior -->
        <button 
          (click)="changePage(currentPage - 1)" 
          [disabled]="currentPage === 1"
          class="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Anterior
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center gap-1">
          <ng-container *ngFor="let p of pages">
            
            <button 
              (click)="changePage(p)"
              class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              [class.bg-[var(--brand)]]="p === currentPage"
              [class.text-white]="p === currentPage"
              [class.text-zinc-600]="p !== currentPage"
              [class.hover:bg-zinc-100]="p !== currentPage">
              {{ p }}
            </button>

          </ng-container>
        </div>

        <!-- Siguiente -->
        <button 
          (click)="changePage(currentPage + 1)" 
          [disabled]="currentPage === totalPages"
          class="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Siguiente
        </button>

      </div>
    </div>
  `
})
export class UiPaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;

  @Output() pageChange = new EventEmitter<number>();

  // Computed for display "Mostrando start - end de total"
  get rangeStart(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get rangeEnd(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  // Simple page generation
  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const visible = 5; // Max visible pages

    let start = Math.max(1, current - Math.floor(visible / 2));
    let end = Math.min(total, start + visible - 1);

    if (end - start + 1 < visible) {
      start = Math.max(1, end - visible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  changePage(p: number) {
    if (p >= 1 && p <= this.totalPages && p !== this.currentPage) {
      this.pageChange.emit(p);
    }
  }
}
