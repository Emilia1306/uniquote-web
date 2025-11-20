import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';              // 👈 agregar
import { AuthService } from '../core/auth/auth.service';
import { TopbarComponent } from '../shared/ui/topbar/topbar.component';
import { SidebarComponent } from '../shared/ui/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    NgIf,                   
    TopbarComponent,
    SidebarComponent,
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent implements OnInit {
  private auth   = inject(AuthService);
  private router = inject(Router);

  // estado del drawer móvil
  open = signal(false);

  toggleDrawer() { this.open.update(v => !v); }
  closeDrawer()  { this.open.set(false); }

  async ngOnInit() {
    await this.auth.loadMeOnce();
    // Cierra el drawer en cualquier navegación
    this.router.events.subscribe(() => this.closeDrawer());
  }
}
