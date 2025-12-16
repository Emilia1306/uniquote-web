import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConstantesApi, Constante, UpdateConstanteDto } from './data/constantes.api';
import { firstValueFrom } from 'rxjs';
import { getDepartment } from './data/departamentos.config';

interface SubGroup {
  name: string;
  items: {
    original: Constante;
    displayName: string;
  }[];
}

interface GroupedData {
  [category: string]: Constante[];
}

@Component({
  standalone: true,
  selector: 'tarifario-page',
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-screen bg-white p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h1 class="text-4xl font-bold text-[var(--brand)] tracking-tight">Tarifario</h1>
          <p class="text-zinc-500 mt-1">Gestiona los costos y tarifas base del sistema</p>
        </div>
      </header>

      <!-- Operations Bar: Tabs & Search -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <!-- Category Tabs -->
        <div class="flex overflow-x-auto gap-2 scrollbar-hide w-full md:w-auto p-1">
            @for (tab of tabs; track tab) {
            <button 
                (click)="selectedTab = tab"
                class="px-6 py-2 rounded-full whitespace-nowrap font-medium transition-all duration-200 text-sm"
                [ngClass]="selectedTab === tab 
                ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10' 
                : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border border-transparent'">
                {{ tab | titlecase }}
            </button>
            }
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80 group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-zinc-400 group-focus-within:text-[var(--brand)] transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <input 
                [(ngModel)]="searchTerm"
                type="text" 
                placeholder="Buscar tarifa..." 
                class="w-full pl-11 pr-4 py-2.5 rounded-full bg-zinc-50 border-2 border-transparent focus:bg-white focus:border-[var(--brand)]/20 focus:ring-4 focus:ring-[var(--brand)]/10 text-sm transition-all"
            >
        </div>
      </div>

      <!-- Content Area -->
      <div class="space-y-10">
          @for (category of getCategoriesToShow(); track category) {
            <!-- Hide category if no items match in any subgroup -->
            @if (hasCategoryMatches(category)) {
                <section class="animate-fade-in">
                    <!-- Category Title -->
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-8 w-1.5 bg-[var(--brand)] rounded-r-full"></div>
                        <h2 class="text-xl font-bold text-zinc-900">{{ category }}</h2>
                    </div>

                    <div class="grid gap-6 pl-0 md:pl-4">
                        @for (group of getSubgroups(groupedData[category]); track group.name) {
                            @if (getMatchingItems(group).length > 0) {
                                <div class="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                    <!-- Subgroup Header -->
                                    @if (group.name !== 'General' && group.name !== category) {
                                        <div class="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
                                            <span class="font-semibold text-zinc-900">{{ group.name }}</span>
                                            <span class="text-xs font-medium bg-white px-2.5 py-1 rounded-md text-zinc-500 border border-zinc-200">
                                                {{ getMatchingItems(group).length }} tarifas
                                            </span>
                                        </div>
                                    }

                                    <div class="overflow-x-auto">
                                        <table class="w-full text-left text-sm">
                                            <thead class="bg-white text-zinc-400 font-medium text-xs uppercase tracking-wider border-b border-zinc-50">
                                                <tr>
                                                    <th class="py-3 px-6 w-1/2">Descripción</th>
                                                    <th class="py-3 px-6 text-right">Valor</th>
                                                    <th class="py-3 px-6 text-right w-20"></th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-zinc-50">
                                                @for (item of getMatchingItems(group); track item.original.id) {
                                                    <tr class="hover:bg-orange-50/30 transition-colors group/row">
                                                        <td class="py-3 px-6 font-medium text-zinc-700 group-hover/row:text-[var(--brand)] transition-colors">
                                                            {{ item.displayName }}
                                                        </td>
                                                        <td class="py-3 px-6 text-right font-mono font-medium text-zinc-900">
                                                            {{ item.original.valor | number:'1.2-2' }}
                                                        </td>
                                                        <td class="py-3 px-6 text-right">
                                                            <button 
                                                                (click)="openEditModal(item.original)"
                                                                class="p-2 rounded-full hover:bg-[var(--brand)]/10 text-zinc-300 hover:text-[var(--brand)] transition-all transform hover:scale-110 active:scale-95"
                                                                title="Editar">
                                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            }
                        }
                    </div>
                </section>
            }
          }
      </div>

    <!-- Edit Modal -->
    @if (editingItem) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
                <div class="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                    <h3 class="font-bold text-lg text-zinc-900">Editar Tarifa</h3>
                    <button (click)="closeEditModal()" class="text-zinc-400 hover:text-zinc-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                
                <div class="p-6 space-y-4">
                    <!-- Info Readonly -->
                    <div class="space-y-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm">
                        <div class="flex justify-between">
                            <span class="text-zinc-500">Categoría:</span>
                            <span class="font-medium text-zinc-900">{{ editingItem.categoria }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-zinc-500">Subcategoría:</span>
                            <span class="font-medium text-zinc-900">{{ editingItem.subcategoria }}</span>
                        </div>
                    </div>

                    <!-- Input Valor -->
                    <div>
                        <label class="block text-sm font-medium text-zinc-700 mb-1">Valor</label>
                        <div class="relative">
                            <span class="absolute left-3 top-2.5 text-zinc-500">$</span>
                            <input 
                                [(ngModel)]="tempValue"
                                type="number" 
                                class="w-full pl-7 pr-4 py-2 rounded-xl border border-zinc-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 transition-all font-mono text-lg"
                                (keydown.enter)="saveEdit()"
                            >
                        </div>
                    </div>
                </div>

                <div class="p-6 pt-2 flex gap-3">
                    <button 
                        (click)="closeEditModal()"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors">
                        Cancelar
                    </button>
                    <button 
                        (click)="saveEdit()"
                        class="flex-1 px-4 py-2.5 rounded-xl bg-[var(--brand)] text-white font-medium hover:opacity-90 transition-colors shadow-lg shadow-[var(--brand)]/20">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    }

  </div>
  `,
  styles: [`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-scale-up { animation: scaleUp 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    `]
})
export class TarifarioPage implements OnInit {
  private api = inject(ConstantesApi);

  constantes: Constante[] = [];
  groupedData: GroupedData = {};
  tabs: string[] = ['Todos'];
  selectedTab: string = 'Todos';
  searchTerm: string = '';

  // Modal State
  editingItem: Constante | null = null;
  tempValue: number = 0;

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
      const cat = item.categoria;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    this.groupedData = grouped;
    this.tabs = ['Todos', ...Object.keys(grouped).sort()];
  }

  getCategoriesToShow(): string[] {
    if (this.selectedTab === 'Todos') {
      return Object.keys(this.groupedData).sort();
    }
    return [this.selectedTab];
  }


  getSubgroups(items: Constante[]): SubGroup[] {
    const groups: { [key: string]: SubGroup } = {};

    // Sorting items allows us to have some consistency
    const sortedItems = [...items].sort((a, b) => a.subcategoria.localeCompare(b.subcategoria));

    sortedItems.forEach(item => {
      // Logic: "Transporte - San Miguel" -> Group: "Transporte", Display: "San Miguel"
      // Logic: "Hotel" -> Group: "General" (or "Hotel"), Display: "Hotel"

      const parts = item.subcategoria.split(' - ');
      let groupName = 'General';
      let displayName = item.subcategoria;

      if (parts.length > 1) {
        groupName = parts[0].trim();
        displayName = parts.slice(1).join(' - ').trim();
      } else {
        // If no dash, try to see if we can group by the first word? 
        // For now, let's put them in 'General' or use the category name if we want, 
        // but user specifically mentioned Prefix grouping.
        // Let's use 'General' for miscellaneous items to separate them from grouped ones.
        groupName = 'General';
      }

      if (!groups[groupName]) {
        groups[groupName] = { name: groupName, items: [] };
      }

      groups[groupName].items.push({ original: item, displayName });
    });

    // Return array sorted by group Name, but usually we want 'General' last or first?
    // Let's sort alphabetically.
    return Object.values(groups).sort((a, b) => {
      if (a.name === 'General') return 1;
      if (b.name === 'General') return -1;
      return a.name.localeCompare(b.name);
    });
  }

  matchesSearch(displayName: string, groupName: string): boolean {
    if (!this.searchTerm) return true;
    const term = this.searchTerm.toLowerCase();
    return displayName.toLowerCase().includes(term) || groupName.toLowerCase().includes(term);
  }

  getMatchingItems(group: SubGroup): { original: Constante, displayName: string }[] {
    return group.items.filter(item => this.matchesSearch(item.displayName, group.name));
  }

  hasCategoryMatches(category: string): boolean {
    // If searching, check if any group in this category has matches
    if (!this.searchTerm) return true;
    const subgroups = this.getSubgroups(this.groupedData[category]);
    return subgroups.some(group => this.getMatchingItems(group).length > 0);
  }

  // Modal Actions
  openEditModal(item: Constante) {
    this.editingItem = item;
    this.tempValue = item.valor;
  }

  closeEditModal() {
    this.editingItem = null;
    this.tempValue = 0;
  }

  async saveEdit() {
    if (!this.editingItem) return;

    try {
      const dto: UpdateConstanteDto = {
        valor: this.tempValue,
        unidad: this.editingItem.unidad // Keep existing unit
      };

      await firstValueFrom(this.api.update(this.editingItem.id, dto));

      // Update local state
      this.editingItem.valor = this.tempValue;
      this.closeEditModal();
    } catch (err) {
      console.error('Error saving changes:', err);
      alert('Error al guardar los cambios');
    }
  }
}
