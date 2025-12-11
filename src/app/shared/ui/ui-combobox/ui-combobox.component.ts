import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UiComboboxItem {
  value: any;
  label: string;
}

@Component({
  standalone: true,
  selector: 'ui-combobox',
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-combobox.component.html',
  styleUrls: ['./ui-combobox.component.scss'],
})
export class UiComboboxComponent implements OnChanges {

  @Input() items: UiComboboxItem[] = [];
  @Input() placeholder: string = 'Seleccione...';
  @Input() value: any = null;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  open = signal(false);
  search = signal('');

  // Detectar cambios desde el padre
  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes) {
      if (this.value === null || this.value === undefined) {
        this.search.set('');
        return;
      }

      const item = this.items.find(i => i.value === this.value);
      this.search.set(item ? item.label : '');
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.ui-combobox')) {
      this.open.set(false);
    }
  }

  get filteredItems() {
    const q = this.search().toLowerCase();
    return this.items.filter(i => i.label.toLowerCase().includes(q));
  }

  toggle() {
    if (this.disabled) return;
    this.open.update(v => !v);
  }

  select(item: UiComboboxItem) {
    if (this.disabled) return;

    this.value = item.value;
    this.search.set(item.label);
    this.valueChange.emit(item.value);
    this.open.set(false);
  }

  onInputChange(txt: string) {
    this.search.set(txt);
    this.open.set(true);

    // Si el usuario borra → emitir null
    if (txt.trim() === '') {
      this.value = null;
      this.valueChange.emit(null);
    }
  }
}
