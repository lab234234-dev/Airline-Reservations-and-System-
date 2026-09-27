import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loading$.pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const user = auth.currentUser;
      if (user && user.role === 'admin') {
        return true;
      }
      router.navigate(['/admin/login']);
      return false;
    })
  );
};

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.loading$.pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const user = auth.currentUser;
      if (user) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
