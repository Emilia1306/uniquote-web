import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface UiSelectItem {
  value: any;
  label: string;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './ui-select.component.html',
  styleUrls: ['./ui-select.component.scss'],
})
export class UiSelectComponent {

  @Input() items: UiSelectItem[] = [];
  @Input() placeholder = 'Seleccione';
  @Input() disabled = false;

  @Input() set value(v: any) {
    this._value = v;
    this.selectedLabel = this.items.find(i => i.value === v)?.label ?? this.placeholder;
  }
  @Output() valueChange = new EventEmitter<any>();

  open = signal(false);
  selectedLabel = this.placeholder;
  private _value: any = null;

  toggle() {
    if (!this.disabled) this.open.update(v => !v);
  }

  select(item: UiSelectItem) {
    this._value = item.value;
    this.selectedLabel = item.label;
    this.valueChange.emit(item.value);
    this.open.set(false);
  }

}
