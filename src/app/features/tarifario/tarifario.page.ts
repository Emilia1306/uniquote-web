import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConstantesApi, Constante, UpdateConstanteDto } from './data/constantes.api';
import { firstValueFrom } from 'rxjs';
import { getDepartment } from './data/departamentos.config';

interface GroupedData {
    [department: string]: {
        [category: string]: Constante[];
    };
}

@Component({
    standalone: true,
    selector: 'tarifario-page',
    imports: [CommonModule, FormsModule],
    template: `
  <div class="min-h-screen bg-zinc-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h1 class="text-3xl font-bold text-zinc-900 tracking-tight">Tarifario</h1>
          <p class="text-zinc-500 mt-1">Gestiona los costos y tarifas base del sistema</p>
        </div>
        
        <button 
          (click)="toggleEditMode()"
          class="inline-flex items-center px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm"
          [ngClass]="isEditMode ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' : 'bg-[var(--brand)] text-white hover:opacity-90'">
          <span class="mr-2">{{ isEditMode ? '🔓' : '🔒' }}</span>
          {{ isEditMode ? 'Finalizar Edición' : 'Habilitar Edición' }}
        </button>
      </header>

      <!-- Department Tabs -->
      <div class="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        @for (dept of departments; track dept) {
          <button 
            (click)="selectedDepartment = dept"
            class="px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200"
            [ngClass]="selectedDepartment === dept 
              ? 'bg-zinc-900 text-white shadow-md transform scale-105' 
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'">
            {{ dept | titlecase }}
          </button>
        }
      </div>

      <!-- Content Area -->
      <div class="grid gap-6">
        @if (groupedData[selectedDepartment]) {
          @for (category of getCategories(selectedDepartment); track category) {
            <section class="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden transition-all duration-300 hover:shadow-md">
              <div class="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
                <div class="h-8 w-1 bg-[var(--brand)] rounded-full"></div>
                <h2 class="text-lg font-bold text-zinc-800">{{ category }}</h2>
                <span class="text-xs font-medium px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md">
                  {{ groupedData[selectedDepartment][category].length }} items
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="bg-zinc-50/30 text-zinc-500 font-medium">
                    <tr>
                      <th class="py-3 px-6 w-1/3">Subcategoría</th>
                      <th class="py-3 px-6 w-1/3 text-right">Valor</th>
                      <th class="py-3 px-6 w-1/3">Unidad</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    @for (item of groupedData[selectedDepartment][category]; track item.id) {
                      <tr class="group hover:bg-zinc-50/80 transition-colors">
                        <td class="py-3 px-6 font-medium text-zinc-700">
                          {{ item.subcategoria }}
                        </td>
                        
                        <!-- Valor Column -->
                        <td class="py-3 px-6 text-right">
                          @if (isEditMode) {
                            <input 
                              [(ngModel)]="item.valor" 
                              (change)="addToPendingUpdates(item)"
                              type="number" 
                              class="w-32 text-right px-3 py-1.5 rounded-lg border border-zinc-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 transition-all font-mono"
                            >
                          } @else {
                            <span class="font-mono font-semibold text-zinc-900">
                              {{ item.valor | number:'1.2-2' }}
                            </span>
                          }
                        </td>

                        <!-- Unidad Column -->
                        <td class="py-3 px-6">
                          @if (isEditMode) {
                            <input 
                              [(ngModel)]="item.unidad"
                              (change)="addToPendingUpdates(item)"
                              type="text" 
                              class="w-full px-3 py-1.5 rounded-lg border border-zinc-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 transition-all"
                            >
                          } @else {
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-xs font-medium">
                              {{ item.unidad || 'N/A' }}
                            </span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          }
        } @else {
          <div class="flex flex-col items-center justify-center py-20 text-zinc-400">
            <svg class="w-16 h-16 mb-4 opacity-20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" clip-rule="evenodd"/>
            </svg>
            <p>No hay items en este departamento</p>
          </div>
        }
      </div>

      <!-- Save Floating Action Button -->
      @if (pendingUpdates.size > 0) {
        <div class="fixed bottom-6 right-6 animate-fade-in-up">
          <button 
            (click)="saveChanges()"
            class="group flex items-center gap-3 px-6 py-4 bg-zinc-900 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
            <div class="flex flex-col items-start gap-0.5">
              <span class="font-bold text-lg">Guardar Cambios</span>
              <span class="text-xs text-zinc-400">{{ pendingUpdates.size }} items modificados</span>
            </div>
            <div class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
          </button>
        </div>
      }
    </div>
  </div>
  `,
    styles: [`
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    `]
})
export class TarifarioPage implements OnInit {
    private api = inject(ConstantesApi);

    constantes: Constante[] = [];
    groupedData: GroupedData = {};
    departments: string[] = [];
    selectedDepartment: string = '';

    isEditMode = false;
    pendingUpdates = new Set<Constante>();

    async ngOnInit() {
        await this.loadData();
    }

    async loadData() {
        try {
            this.constantes = await firstValueFrom(this.api.findAll());
            this.groupData();
        } catch (err) {
            console.error('Error loading constantes:', err);
        }
    }

    private groupData() {
        const grouped: GroupedData = {};

        this.constantes.forEach(item => {
            const dept = getDepartment(item.categoria);
            const cat = item.categoria;

            if (!grouped[dept]) grouped[dept] = {};
            if (!grouped[dept][cat]) grouped[dept][cat] = [];

            grouped[dept][cat].push(item);
        });

        this.groupedData = grouped;
        this.departments = Object.keys(grouped).sort();
        if (this.departments.length > 0 && !this.selectedDepartment) {
            this.selectedDepartment = this.departments[0];
        }
    }

    getCategories(department: string): string[] {
        return this.groupedData[department] ? Object.keys(this.groupedData[department]).sort() : [];
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        if (!this.isEditMode) {
            this.pendingUpdates.clear();
        }
    }

    addToPendingUpdates(item: Constante) {
        this.pendingUpdates.add(item);
    }

    async saveChanges() {
        try {
            const updates = Array.from(this.pendingUpdates);
            const promises = updates.map(item => {
                const dto: UpdateConstanteDto = {
                    valor: item.valor,
                    unidad: item.unidad
                };
                return firstValueFrom(this.api.update(item.id, dto));
            });

            await Promise.all(promises);
            this.pendingUpdates.clear();
            this.isEditMode = false;
            // Using browser alert for simplicity in this turn, but toast would be better.
            alert('Cambios guardados correctamente');
        } catch (err) {
            console.error('Error saving changes:', err);
            alert('Error al guardar algunos cambios');
        }
    }
}
