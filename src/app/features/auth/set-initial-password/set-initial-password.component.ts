// src/app/features/auth/set-initial-password/set-initial-password.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    standalone: true,
    selector: 'app-set-initial-password',
    imports: [CommonModule, FormsModule],
    templateUrl: './set-initial-password.component.html',
})
export class SetInitialPasswordComponent {
    private auth = inject(AuthService);
    private router = inject(Router);

    newPassword = '';
    confirmPassword = '';
    loading = signal(false);
    error = signal<string | null>(null);
    success = signal<string | null>(null);

    constructor() {
        // Si no hay token, volver al login
        if (!this.auth.tempPwdToken()) {
            this.router.navigateByUrl('/login');
        }
    }

    async submit() {
        this.error.set(null);
        this.success.set(null);

        if (this.newPassword.length < 8) {
            this.error.set('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.error.set('Las contraseñas no coinciden.');
            return;
        }

        this.loading.set(true);
        try {
            await this.auth.setInitialPassword(this.newPassword);
            this.success.set('Contraseña actualizada correctamente. Redirigiendo al login...');
            setTimeout(() => {
                this.router.navigateByUrl('/login');
            }, 2000);
        } catch (e: any) {
            // Mejor manejo de error si es objeto
            const msg = e?.error?.message ?? e?.message ?? 'Error actualizando contraseña';
            this.error.set(msg);
        } finally {
            this.loading.set(false);
        }
    }
}
