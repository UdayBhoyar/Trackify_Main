import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <div>
        <p class="eyebrow">Join the crew</p>
        <h1>Create your account</h1>
        <p class="muted">Budget, log, and visualize your cash flow.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          <span>Name</span>
          <input formControlName="name" type="text" placeholder="Uday" />
        </label>
        <label>
          <span>Email</span>
          <input formControlName="email" type="email" placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <div class="password-field">
            <input
              formControlName="password"
              [type]="showPassword ? 'text' : 'password'"
              placeholder="Min 6 characters"
            />
            <button type="button" class="eye" (click)="togglePassword()" aria-label="Toggle password visibility">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </label>

        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Creating...' : 'Register' }}
        </button>
        <p class="muted center">Have an account? <a routerLink="/login">Login</a></p>
        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </section>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a2f4d 100%);
    }

    .auth-card {
      max-width: 420px;
      width: 100%;
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 1.5rem;
      box-shadow: 0 25px 70px rgba(139, 92, 246, 0.15);
      color: #1f2937;
      animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 { 
      margin: 0.5rem 0 0.75rem;
      color: #1f2937;
      font-size: 1.75rem;
      font-weight: 800;
    }

    .eyebrow { 
      text-transform: uppercase; 
      letter-spacing: 0.12em; 
      color: #8b5cf6;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .muted { 
      color: #6b7280;
      font-size: 0.95rem;
    }

    form { 
      display: grid; 
      gap: 1.25rem; 
      margin-top: 1.75rem;
    }

    label { 
      display: grid; 
      gap: 0.5rem; 
      color: #374151;
      font-weight: 600;
      font-size: 0.9rem;
    }

    input { 
      background: #f9fafb;
      border: 1.5px solid #e5e7eb;
      border-radius: 0.9rem; 
      padding: 0.9rem 1rem; 
      color: #1f2937;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      
      &::placeholder {
        color: #9ca3af;
      }

      &:focus {
        outline: none;
        border-color: #8b5cf6;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
      }
    }

    .password-field { 
      position: relative; 
      display: flex; 
      align-items: center;
    }

    .password-field input { 
      flex: 1; 
      padding-right: 2.75rem;
    }

    .eye { 
      position: absolute; 
      right: 0.9rem; 
      background: transparent; 
      border: none; 
      color: #6b7280; 
      cursor: pointer; 
      font-size: 1rem;
      transition: all 0.3s ease;
      padding: 0.25rem;

      &:hover {
        color: #8b5cf6;
        transform: scale(1.1);
      }

      &:focus {
        outline: none;
      }
    }

    button { 
      padding: 1rem 1.25rem; 
      border-radius: 0.9rem; 
      border: none; 
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
      font-weight: 700; 
      cursor: pointer;
      font-size: 0.95rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 15px 35px rgba(139, 92, 246, 0.35);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled { 
        opacity: 0.6; 
        cursor: not-allowed;
      }
    }

    .center { 
      text-align: center;
      margin-top: 0.5rem;
    }

    .center a {
      color: #8b5cf6;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        color: #7c3aed;
        text-decoration: underline;
      }
    }

    .error { 
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      margin: 0;
      animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 1.75rem;
        border-radius: 1.25rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = '';
  showPassword = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { name, email, password } = this.form.value;
    this.auth.register(name!, email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Registration failed. Email may be taken.';
        this.loading = false;
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
