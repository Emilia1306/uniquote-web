// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = '';
  password = '';
  showPwd = false;
  loading = signal(false);
  error = signal<string | null>(null);

  async submit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.loginOrAskMfa({ email: this.email.trim(), password: this.password });
      // Si la API pidió MFA, el service te manda a /verificacion
    } catch (e: any) {
      this.error.set(e?.message ?? 'Error iniciando sesión');
    } finally {
      this.loading.set(false);
    }
  }
}
