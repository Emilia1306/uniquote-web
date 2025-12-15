// src/app/features/auth/verify/verify.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-verify',
  imports: [CommonModule, FormsModule],
  templateUrl: './verify.component.html',
})
export class VerifyComponent {
  private auth = inject(AuthService);

  code = '';
  rememberDevice = true;
  loading = signal(false);
  error = signal<string | null>(null);
  email = this.auth.pendingEmail(); 

  async submit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.verifyEmailCode(this.code.trim(), this.rememberDevice);
      // al éxito, el service guarda token y redirige por rol
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo verificar el código');
    } finally {
      this.loading.set(false);
    }
  }

  async resend() {
    this.error.set(null);
    try {
      await this.auth.resendEmailCode();
    } catch (e: any) {
      this.error.set(e?.message ?? 'No se pudo reenviar el código');
    }
  }
}
