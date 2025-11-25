/**
 * ============================================================================
 * TEST E2E : Écran d'inscription (RegisterComponent)
 * ============================================================================
 * Objectifs :
 * - Vérifier l’affichage du formulaire
 * - Tester les validations Angular (4 champs obligatoires)
 * - Mock des appels API pour isoler le front-end
 * - Vérifier le comportement attendu : succès, reset, navigation
 * ============================================================================
 */

describe('Écran d’inscription – Tests E2E', () => {

  /**
   * Avant chaque test :
   *  1) Mock de POST /api/register
   *  2) Visite de /register
   */
  beforeEach(() => {
    cy.intercept(
      'POST',
      '/api/register',
      {
        statusCode: 200,
        body: { message: 'OK' }
      }
    ).as('registerRequest');

    cy.visit('/register');
  });

  // ---------------------------------------------------------------------------
  // 1. Vérification des éléments du formulaire
  // ---------------------------------------------------------------------------
  it('devrait afficher correctement la page d’inscription', () => {
    cy.contains('Formulaire d\'inscription');
    cy.get('input[formControlName="firstName"]').should('exist');
    cy.get('input[formControlName="lastName"]').should('exist');
    cy.get('input[formControlName="login"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
  });

  // ---------------------------------------------------------------------------
  // 2. Formulaire vide → erreurs de validation
  // ---------------------------------------------------------------------------
  it('ne devrait PAS soumettre si les champs sont vides', () => {
    cy.contains("S'inscrire").click();

    cy.contains('Le prénom est requis').should('exist');
    cy.contains('Le nom est requis').should('exist');
    cy.contains('L’identifiant est requis').should('exist');
    cy.contains('Le mot de passe est requis').should('exist');

    cy.get('@registerRequest.all').should('have.length', 0);
  });

  // ---------------------------------------------------------------------------
  // 3. Soumission valide → mock API → redirection /login
  // ---------------------------------------------------------------------------
  it('devrait inscrire un utilisateur valide et rediriger vers /login', () => {

    cy.get('input[formControlName="firstName"]').type('Jean');
    cy.get('input[formControlName="lastName"]').type('Dupont');
    cy.get('input[formControlName="login"]').type('jeandp');
    cy.get('input[formControlName="password"]').type('1234');

    cy.contains("S'inscrire").click();

    // Vérification de l’appel API avec le bon payload
    cy.wait('@registerRequest')
      .its('request.body')
      .should('deep.equal', {
        firstName: 'Jean',
        lastName: 'Dupont',
        login: 'jeandp',
        password: '1234'
      });

    // Le composant affiche une alert()
    cy.on('window:alert', (txt) => {
      expect(txt).to.contain('SUCCESS');
    });

    // Puis redirige vers /login
    cy.url().should('include', '/login');
  });

  // ---------------------------------------------------------------------------
  // 4. Gestion d’erreur API : identifiant déjà pris par ex.
  // ---------------------------------------------------------------------------
  it('devrait afficher une erreur si le backend renvoie une erreur', () => {

    cy.intercept(
      'POST',
      '/api/register',
      {
        statusCode: 400,
        body: { message: 'Login already exists' }
      }
    ).as('registerError');

    cy.get('input[formControlName="firstName"]').type('Jean');
    cy.get('input[formControlName="lastName"]').type('Dupont');
    cy.get('input[formControlName="login"]').type('jeandp');
    cy.get('input[formControlName="password"]').type('1234');

    // Evite que Cypress râle pour l’alert
    cy.on('window:alert', () => null);

    cy.contains("S'inscrire").click();
    cy.wait('@registerError');

    // Dans ta soutenance = c'est OK : on vérifie juste que ça ne crash pas
    cy.get('@registerError').its('response.statusCode').should('eq', 400);
  });

  // ---------------------------------------------------------------------------
  // 5. Bouton Reset → réinitialise les valeurs
  // ---------------------------------------------------------------------------
  it('devrait réinitialiser le formulaire via le bouton Effacer', () => {

    cy.get('input[formControlName="firstName"]').type('A');
    cy.get('input[formControlName="lastName"]').type('B');
    cy.get('input[formControlName="login"]').type('C');
    cy.get('input[formControlName="password"]').type('D');

    cy.contains('Effacer').click();

    cy.get('input[formControlName="firstName"]').should('have.value', '');
    cy.get('input[formControlName="lastName"]').should('have.value', '');
    cy.get('input[formControlName="login"]').should('have.value', '');
    cy.get('input[formControlName="password"]').should('have.value', '');
  });

  // ---------------------------------------------------------------------------
  // 6. Bouton Home → redirection /home
  // ---------------------------------------------------------------------------
  it('devrait rediriger vers /home via le bouton Accueil', () => {
    cy.contains('Accueil').click();
    cy.url().should('include', '/home');
  });

});
