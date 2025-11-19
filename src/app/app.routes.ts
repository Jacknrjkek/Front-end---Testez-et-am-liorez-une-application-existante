import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // Redirection depuis /
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  // Home
  {
    path: 'home',
    component: HomeComponent
  },

  // Login
  {
    path: 'login',
    component: LoginComponent
  },

  // Register
  {
    path: 'register',
    component: RegisterComponent
  },

  // Students (protégé)
  {
    path: 'students',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/students/student-list.component')
        .then(m => m.StudentListComponent)
  },

  // fallback
  {
    path: '**',
    redirectTo: 'home'
  }
];
