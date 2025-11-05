import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../shared/ui/topbar/topbar.component';
import { SidebarComponent } from '../shared/ui/sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {}
