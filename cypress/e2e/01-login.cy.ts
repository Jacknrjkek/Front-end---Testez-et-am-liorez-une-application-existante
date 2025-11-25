/**
 * ============================================================================
 * TEST E2E : Écran de connexion (Login)
 * ============================================================================
 * Objectifs :
 * - Vérifier l’affichage général de la page
 * - Remplir et valider le formulaire de connexion
 * - Mock de l’API pour isoler le front-end
 * - Vérifier la navigation et le stockage du token
 * ============================================================================
 */

describe('Écran de connexion – Tests E2E', () => {

  /**
   * Avant chaque test :
   *  1. Mock de la route POST /api/login pour éviter un vrai backend
   *  2. Visite de la page "/login"
   */
  beforeEach(() => {

    // Mock API – interception du backend
    cy.intercept(
      'POST',
      '/api/login',
      {
        statusCode: 200,
        body: { token: 'FAKE_JWT' }
      }
    ).as('loginRequest');

    // On ouvre la page du formulaire
    cy.visit('/login');
  });

  // ---------------------------------------------------------------------------
  // 1. Vérification de l’affichage général
  // ---------------------------------------------------------------------------
  it('devrait afficher la page de connexion', () => {
    cy.contains('Formulaire de connexion');
    cy.get('input[formControlName="login"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
  });

  // ---------------------------------------------------------------------------
  // 2. Refuser la soumission si le formulaire est vide
  // ---------------------------------------------------------------------------
  it('ne devrait pas soumettre si les champs sont vides', () => {

    cy.contains('Se connecter').click();

    // Message d’erreur attendu : validation Angular
    cy.contains('L’identifiant est requis').should('exist');
    cy.contains('Le mot de passe est requis').should('exist');

    // L’API NE DOIT PAS être appelée
    cy.wait(200); // petite pause pour être sûr
    cy.get('@loginRequest.all').should('have.length', 0);
  });

  // ---------------------------------------------------------------------------
  // 3. Connexion OK : mock API, token localStorage, navigation
  // ---------------------------------------------------------------------------
  it('devrait permettre une connexion valide', () => {

    // Saisie des identifiants
    cy.get('input[formControlName="login"]').type('jean');
    cy.get('input[formControlName="password"]').type('1234');

    // Soumission
    cy.contains('Se connecter').click();

    // Vérification de l'appel API mocké
    cy.wait('@loginRequest')
      .its('request.body')
      .should('deep.equal', {
        login: 'jean',
        password: '1234'
      });

    // Vérification du stockage du token en localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.equal('FAKE_JWT');
    });

    // Navigation vers /students
    cy.url().should('include', '/students');
  });

  // ---------------------------------------------------------------------------
  // 4. Gestion d’erreur : identifiants invalides → message d’erreur
  // ---------------------------------------------------------------------------
  it('devrait afficher une erreur si le backend renvoie une erreur', () => {

    // On remplace temporairement notre mock par un mock "erreur"
    cy.intercept(
      'POST',
      '/api/login',
      {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }
    ).as('loginError');

    cy.get('input[formControlName="login"]').type('wrong');
    cy.get('input[formControlName="password"]').type('wrong');

    cy.contains('Se connecter').click();

    cy.wait('@loginError');

    // L’alert Angular étant réelle, Cypress peut la capter :
    cy.on('window:alert', (txt) => {
      expect(txt).to.contain('Incorrect');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Bouton "Effacer" → reset du formulaire
  // ---------------------------------------------------------------------------
  it('devrait réinitialiser le formulaire via le bouton Effacer', () => {

    cy.get('input[formControlName="login"]').type('aaa');
    cy.get('input[formControlName="password"]').type('bbb');

    cy.contains('Effacer').click();

    cy.get('input[formControlName="login"]').should('have.value', '');
    cy.get('input[formControlName="password"]').should('have.value', '');
  });

  // ---------------------------------------------------------------------------
  // 6. Bouton "Accueil" → navigation vers /home
  // ---------------------------------------------------------------------------
  it('devrait rediriger vers /home via le bouton Accueil', () => {

    cy.contains('Accueil').click();

    cy.url().should('include', '/home');
  });

});
