import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If no token at all, redirect to login
  if (!auth.token) {
    router.navigate(['/login']);
    return false;
  }

  // If already authenticated (user data loaded), allow access
  if (auth.isAuthenticated) {
    return true;
  }

  // Has token but no user data - try to refresh profile to validate token
  // This happens on page reload when token is in localStorage but user data is not in memory
  try {
    await firstValueFrom(auth.refreshProfile());
    return true;
  } catch (error) {
    // Token is invalid - clear and redirect
    auth.logout();
    router.navigate(['/login']);
    return false;
  }
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If no token, redirect to login
  if (!auth.token) {
    router.navigate(['/login']);
    return false;
  }

  // If not authenticated yet, try to refresh profile to validate token
  // This happens on page reload when token exists but user data is not in memory
  if (!auth.isAuthenticated) {
    try {
      await firstValueFrom(auth.refreshProfile());
    } catch (error) {
      // Token is invalid - clear and redirect
      console.log('Invalid token detected in admin guard, logging out');
      auth.logout();
      router.navigate(['/login']);
      return false;
    }
  }

  // Check if user has admin role
  if ((auth.role ?? '').toLowerCase() === 'admin') {
    return true;
  }
  
  // User is authenticated but not admin - redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};
