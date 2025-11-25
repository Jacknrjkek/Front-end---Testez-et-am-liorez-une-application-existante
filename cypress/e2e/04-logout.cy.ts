/**
 * ============================================================================
 * TEST E2E – Déconnexion
 * ============================================================================
 * Objectifs :
 * - Vérifier que cliquer sur "Déconnexion" supprime le token
 * - Vérifier que l’utilisateur est redirigé vers /home
 * ============================================================================
 */

describe('Déconnexion depuis la page Students', () => {

  beforeEach(() => {
    // On simule un utilisateur connecté
    localStorage.setItem('token', 'FAKE_JWT');

    // Mock du GET students
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    }).as('getStudents');

    cy.visit('/students');
    cy.wait('@getStudents');
  });

  it('devrait supprimer le token et rediriger vers /home', () => {
    cy.contains('Déconnexion').click();

    // Le token doit disparaître
    cy.window().then(win => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });

    // L’utilisateur doit être renvoyé vers /home
    cy.url().should('include', '/home');
  });

});
