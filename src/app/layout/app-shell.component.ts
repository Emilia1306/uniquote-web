import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { TopbarComponent } from '../shared/ui/topbar/topbar.component';
import { SidebarComponent } from '../shared/ui/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-shell',
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent implements OnInit {
  private auth = inject(AuthService);

  async ngOnInit() {
    // Rehidrata sesión si hay token
    await this.auth.loadMeOnce();
  }
}
