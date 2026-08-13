import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const isLoggedIn =

    localStorage.getItem('isLoggedIn') === 'true' ||

    sessionStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {

    return true;

  }

  router.navigate(['/login']);

  return false;

};