/**
 * ============================================================================
 * TEST E2E – Route protégée (AuthGuard)
 * ============================================================================
 * Objectifs :
 * - Vérifier qu'un utilisateur non connecté NE PEUT PAS aller sur /students
 * - Vérifier la redirection automatique vers /login ou /home (selon ton app)
 * ============================================================================
 */

describe('Protection des routes – accès interdit sans token', () => {

  it('devrait rediriger vers /login si pas de token', () => {
    // On s’assure qu’il n’y a aucun token
    localStorage.removeItem('token');

    cy.visit('/students');

    // Selon ton guard : login ou home
    cy.url().should('include', '/login');
  });

});
