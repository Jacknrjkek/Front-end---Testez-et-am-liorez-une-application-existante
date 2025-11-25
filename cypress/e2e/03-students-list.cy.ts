/**
 * ============================================================================
 * TEST E2E – Page /students (Liste + actions CRUD via modals Bootstrap)
 * ============================================================================
 * Objectifs :
 * - Vérifier l'affichage initial via GET
 * - Tester le bouton "Créer un étudiant" → ouverture du createModal
 * - Tester le bouton "Modifier" → ouverture du editModal avec pré-remplissage
 * - Tester la suppression (DELETE) avec confirm() mocké
 * ============================================================================
 */

describe('Page Students – Liste + Modals CRUD', () => {

  beforeEach(() => {

    // Injection d'un faux token JWT pour bypass l'écran de login
    cy.window().then(win => {
      win.localStorage.setItem('token', 'FAKE_JWT');
    });

    // Mock du GET initial
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        { id: 2, firstName: 'Anna', lastName: 'Smith', email: 'anna@test.com' }
      ]
    }).as('getStudents');

    cy.visit('/students');
    cy.wait('@getStudents');
  });

  // ---------------------------------------------------------------------------
  // 1. Vérification de la liste
  // ---------------------------------------------------------------------------
  it('devrait afficher les étudiants dans la table', () => {
    cy.contains('John');
    cy.contains('Doe');
    cy.contains('john@test.com');

    cy.contains('Anna');
    cy.contains('Smith');
    cy.contains('anna@test.com');
  });

  // ---------------------------------------------------------------------------
  // 2. Modal de création
  // ---------------------------------------------------------------------------
  it('devrait ouvrir le modal de création', () => {
    cy.contains('Créer un étudiant').click();
    cy.get('#createModal').should('exist').should('have.class', 'show');
  });

  // ---------------------------------------------------------------------------
  // 3. Modal d’édition pré-rempli
  // ---------------------------------------------------------------------------
  it('devrait ouvrir le modal d’édition avec pré-remplissage', () => {

    cy.get('table tbody tr').first().within(() => {
      cy.contains('Modifier').click();
    });

    cy.get('#editModal')
      .should('exist')
      .should('have.class', 'show');

    cy.get('#editModal input[formControlName="firstName"]')
      .should('have.value', 'John');

    cy.get('#editModal input[formControlName="email"]')
      .should('have.value', 'john@test.com');
  });

  // ---------------------------------------------------------------------------
  // 4. Suppression (DELETE)
  // ---------------------------------------------------------------------------
  it('devrait supprimer un étudiant', () => {

    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(true);
    });

    cy.intercept('DELETE', '/api/students/1', { statusCode: 200 })
      .as('deleteStudent');

    cy.get('table tbody tr').first().within(() => {
      cy.contains('Supprimer').click();
    });

    cy.wait('@deleteStudent')
      .its('response.statusCode')
      .should('eq', 200);
  });

});


/**
 * ============================================================================
 * TEST CRÉATION D'ÉTUDIANT – Modal Create
 * ============================================================================
 * Objectifs :
 * - Ouvrir le modal de création
 * - Remplir les 3 champs du formulaire
 * - Mock du POST /api/students
 * - Mock du nouveau GET après création
 * - Vérifier que le modal se ferme et que la liste est rafraîchie
 * ============================================================================
 */

describe('Page Students – CREATE étudiant', () => {

  beforeEach(() => {
    // Mock GET initial
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' }
      ]
    }).as('getStudents');

    // Bypass login
    window.localStorage.setItem('token', 'FAKE_TOKEN');

    cy.visit('/students');
    cy.wait('@getStudents');
  });

  it('devrait créer un nouvel étudiant via le modal', () => {

    // Mock du POST
    cy.intercept('POST', '/api/students', {
      statusCode: 201,
      body: { id: 2, firstName: 'Anna', lastName: 'Smith', email: 'anna@test.com' }
    }).as('createStudent');

    // Mock du GET après création
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        { id: 2, firstName: 'Anna', lastName: 'Smith', email: 'anna@test.com' }
      ]
    }).as('reloadStudents');

    // Ouvrir le modal
    cy.contains('Créer un étudiant').click();

    cy.get('#createModal').should('have.class', 'show');

    // Remplir le formulaire
    cy.get('#createModal input[formControlName="firstName"]').type('Anna');
    cy.get('#createModal input[formControlName="lastName"]').type('Smith');
    cy.get('#createModal input[formControlName="email"]').type('anna@test.com');

    // Valider
    cy.get('#createModal button[type="submit"]').click();

    // Attente POST + GET de reload
    cy.wait('@createStudent').its('response.statusCode').should('eq', 201);
    cy.wait('@reloadStudents');

    // Le modal doit être fermé
    cy.get('#createModal').should('not.have.class', 'show');

    // La liste doit afficher le nouvel étudiant
    cy.contains('Anna');
    cy.contains('Smith');
    cy.contains('anna@test.com');
  });

});

/**
 * ============================================================================
 * TEST ÉDITION D'ÉTUDIANT – Modal Edit
 * ============================================================================
 * Objectifs :
 * - Ouvrir modal d’édition
 * - Champs pré-remplis
 * - Modifier les valeurs
 * - Mock du PUT
 * - Mock du GET après update
 * - Vérifier fermeture du modal + refresh liste
 * ============================================================================
 */

describe('Page Students – EDIT étudiant', () => {

  beforeEach(() => {
    // Mock GET initial
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' }
      ]
    }).as('getStudents');

    window.localStorage.setItem('token', 'FAKE_TOKEN');

    cy.visit('/students');
    cy.wait('@getStudents');
  });

  it('devrait modifier un étudiant via le modal', () => {

    // Mock PUT /update/1
    cy.intercept('PUT', '/api/students/1', {
      statusCode: 200,
      body: { id: 1, firstName: 'Johnny', lastName: 'Doe', email: 'johnny@test.com' }
    }).as('updateStudent');

    // Mock GET après update
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'Johnny', lastName: 'Doe', email: 'johnny@test.com' }
      ]
    }).as('reloadStudents');

    // Ouvrir modal edit
    cy.contains('Modifier').click();

    cy.get('#editModal').should('have.class', 'show');

    // Vérifier pré-remplissage
    cy.get('#editModal input[formControlName="firstName"]').should('have.value', 'John');

    // Modifier données
    cy.get('#editModal input[formControlName="firstName"]').clear().type('Johnny');
    cy.get('#editModal input[formControlName="email"]').clear().type('johnny@test.com');

    // Soumettre
    cy.get('#editModal button[type="submit"]').click();

    cy.wait('@updateStudent');
    cy.wait('@reloadStudents');

    // Modal fermé
    cy.get('#editModal').should('not.have.class', 'show');

    // Liste mise à jour
    cy.contains('Johnny');
    cy.contains('johnny@test.com');
  });

});
