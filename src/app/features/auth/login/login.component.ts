import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = '';
  password = '';
  loading = false;
  showPwd = false;

  async submit() {
    if (this.loading) return;
    this.loading = true;
    try {
      await this.auth.login(this.email, this.password);
    } finally {
      this.loading = false;
    }
  }
}
