import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ---------------------------------------------------------------------------
  // ROUTES PUBLIQUES (Eager Loading)
  // Ces composants sont chargés dès le démarrage de l'application.
  // ---------------------------------------------------------------------------
  {
    path: 'home',
    component: HomeComponent,
    title: 'Accueil'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Inscription'
  },

  // ---------------------------------------------------------------------------
  // ROUTES PROTÉGÉES (Lazy Loading)
  // Chargement différé pour optimiser la taille du bundle initial.
  // ---------------------------------------------------------------------------
  {
    path: 'students',
    // Sécurité : Le Guard vérifie si l'utilisateur est connecté avant d'autoriser l'accès
    canActivate: [authGuard],
    // Performance : Le composant n'est téléchargé que si l'utilisateur accède à cette route
    loadComponent: () =>
      import('./pages/students/student-list.component')
        .then(m => m.StudentListComponent),
     title: 'Gestion des étudiants'
  },

  // ---------------------------------------------------------------------------
  // REDIRECTIONS & GESTION D'ERREURS
  // ---------------------------------------------------------------------------

  // Redirection de la racine vers la page d'accueil par défaut
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' // Important : assure que seule l'URL vide exacte déclenche la redirection
  },

  // Wildcard (Joker) : Intercepte toutes les URLs non définies (Erreur 404)
  // Redirige ici vers l'accueil, mais pourrait rediriger vers une page "Not Found" dédiée
  {
    path: '**',
    redirectTo: ''
  }
];
