import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page" *ngIf="auth.user$ | async as user">
      <div class="header">
        <h2>Profile Information</h2>
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
        <div class="grid">
          <div class="left">
            <label>
              <span class="label">Full Name:</span>
              <input 
                formControlName="name" 
                type="text" 
                placeholder="Enter your name"
                [readonly]="!isEditing"
              />
              <div class="progress-bar">
                <div class="fill" [style.width.%]="nameProgress()"></div>
              </div>
            </label>
          </div>

          <div class="right">
            <div class="info-card">
              <p class="label">Profile:</p>
              <div class="info-row">
                <span class="label">Email Address</span>
                <input 
                  *ngIf="isEditing" 
                  formControlName="email" 
                  type="email" 
                  class="edit-input"
                />
                <p class="value" *ngIf="!isEditing">{{ user.email }}</p>
              </div>
              <div class="info-row">
                <span class="label">Password</span>
                <div class="password-wrapper" *ngIf="isEditing">
                  <input 
                    formControlName="password" 
                    [type]="showPassword ? 'text' : 'password'"
                    placeholder="Enter new password"
                    class="edit-input"
                  />
                  <button 
                    type="button" 
                    class="toggle-password" 
                    (click)="showPassword = !showPassword"
                  >
                    {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
                <p class="value" *ngIf="!isEditing">••••••••</p>
              </div>
              <div class="button-group">
                <button 
                  type="button" 
                  class="edit-btn" 
                  *ngIf="!isEditing"
                  (click)="enableEditing()"
                >
                  Edit Profile
                </button>
                <button 
                  type="submit" 
                  class="save-btn" 
                  *ngIf="isEditing"
                  [disabled]="profileForm.invalid || !profileForm.dirty || saving"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
                <button 
                  type="button" 
                  class="cancel-btn" 
                  *ngIf="isEditing"
                  (click)="cancelEditing()"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <p class="success" *ngIf="successMsg">{{ successMsg }}</p>
      <p class="error" *ngIf="errorMsg">{{ errorMsg }}</p>
    </section>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 1.5rem; background: #fff; border-radius: 1.25rem; box-shadow: 0 10px 40px rgba(15,23,42,0.1); }
    .header h2 { margin: 0 0 1.5rem; color: #1f2937; font-size: 1.5rem; }
    
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .left, .right { display: flex; flex-direction: column; gap: 1rem; }
    
    label { display: flex; flex-direction: column; gap: 0.5rem; }
    .label { text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; color: #6b7280; font-weight: 600; }
    
    input { 
      background: #f3f4f6; 
      border: 1px solid #e5e7eb; 
      border-radius: 0.75rem; 
      padding: 0.85rem 1rem; 
      color: #1f2937; 
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    input:focus { border-color: #3b82f6; background: #fff; }
    input[readonly] { background: #e5e7eb; cursor: not-allowed; }
    
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .password-wrapper input {
      flex: 1;
      padding-right: 3rem;
    }
    
    .toggle-password {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    
    .toggle-password:hover {
      opacity: 1;
    }
    
    .edit-input { 
      background: #fff; 
      border: 2px solid #3b82f6; 
    }
    
    .progress-bar { 
      height: 6px; 
      background: #e5e7eb; 
      border-radius: 999px; 
      overflow: hidden; 
      margin-top: 0.25rem;
    }
    .fill { 
      height: 100%; 
      background: linear-gradient(90deg, #10b981, #22c55e); 
      transition: width 0.3s ease;
    }
    
    .info-card { 
      background: #f9fafb; 
      border: 1px solid #e5e7eb; 
      border-radius: 1rem; 
      padding: 1.5rem; 
      display: flex; 
      flex-direction: column; 
      gap: 1rem;
    }
    .info-row { 
      display: flex; 
      flex-direction: column; 
      gap: 0.25rem; 
      padding-bottom: 0.75rem; 
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-of-type { border-bottom: none; padding-bottom: 0; }
    .value { margin: 0; color: #1f2937; font-size: 0.95rem; }
    
    .button-group { 
      display: flex; 
      gap: 0.75rem; 
      margin-top: 0.5rem; 
    }
    
    .edit-btn, .save-btn, .cancel-btn { 
      border: none; 
      border-radius: 0.75rem; 
      padding: 0.85rem 1.25rem; 
      font-weight: 600; 
      cursor: pointer; 
      transition: transform 0.2s;
      flex: 1;
    }
    
    .edit-btn { 
      background: linear-gradient(135deg, #1e3a8a, #3b82f6); 
      color: #fff; 
    }
    .edit-btn:hover { transform: translateY(-2px); }
    
    .save-btn { 
      background: linear-gradient(135deg, #059669, #10b981); 
      color: #fff; 
    }
    .save-btn:hover:not(:disabled) { transform: translateY(-2px); }
    .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    
    .cancel-btn { 
      background: #e5e7eb; 
      color: #6b7280; 
    }
    .cancel-btn:hover { background: #d1d5db; }
    
    .success { color: #059669; margin-top: 1rem; font-weight: 600; }
    .error { color: #dc2626; margin-top: 1rem; font-weight: 600; }
    
    @media (max-width: 768px) { 
      .grid { grid-template-columns: 1fr; } 
      .button-group { flex-direction: column; }
    }
  `]
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  saving = false;
  successMsg = '';
  errorMsg = '';
  isEditing = false;
  showPassword = false;
  private originalValues: any = {};

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['']
  });

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.originalValues = {
          name: user.name,
          email: user.email,
          password: ''
        };
        this.profileForm.patchValue(this.originalValues);
      }
    });
  }

  nameProgress(): number {
    const name = this.profileForm.value.name || '';
    return Math.min((name.length / 20) * 100, 100);
  }

  enableEditing() {
    this.isEditing = true;
    this.showPassword = false;
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelEditing() {
    this.isEditing = false;
    this.showPassword = false;
    this.profileForm.patchValue(this.originalValues);
    this.profileForm.markAsPristine();
    this.successMsg = '';
    this.errorMsg = '';
  }

  saveProfile() {
    if (this.profileForm.invalid || !this.profileForm.dirty) return;
    
    const password = this.profileForm.value.password?.trim();
    
    // Validate password length if provided
    if (password && password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters long.';
      setTimeout(() => this.errorMsg = '', 5000);
      return;
    }
    
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    const { name, email } = this.profileForm.value;
    
    // Debug: Log token
    console.log('Token exists:', !!this.auth.token);
    console.log('User authenticated:', this.auth.isAuthenticated);
    
    this.auth.updateProfile(name!, email!, password || undefined).subscribe({
      next: (user) => {
        this.saving = false;
        this.isEditing = false;
        
        // Update original values to new saved values
        this.originalValues = {
          name: user.name,
          email: user.email,
          password: ''
        };
        this.profileForm.patchValue({ ...this.originalValues });
        this.profileForm.markAsPristine();
        
        this.successMsg = 'Profile updated successfully!';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.saving = false;
        console.error('Update profile error:', err);
        
        // Better error handling
        let errorMessage = 'Failed to update profile.';
        
        if (err.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (err.status === 409) {
          errorMessage = 'Email is already taken.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }
        
        this.errorMsg = errorMessage;
        setTimeout(() => this.errorMsg = '', 5000);
      }
    });
  }
}
