describe('Navbar', function() {
    beforeEach(() => {
        cy.on('uncaught:exception', (err, runnable) => {
            expect(err.message).to.include("Cannot read property 'getBoundingClientRect' of null");
            return false;
        })
    });
    it('should goto calories', () => {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();

        cy.get('.calories-nav-btn').click();
        cy.contains("Weight on");
        cy.contains("Consumed Foods");
    });
    it('should goto todos', () => {
        cy.get('.todo-nav-btn').click();
        cy.contains("Example Todo 1");
    });
    it('should goto notes', () => {
        cy.get('.notes-nav-btn').click();
        cy.contains('An example note');
    });
    it('should goto schedule', () => {
        cy.get('.schedule-nav-btn').click();
        cy.contains('Monday');
        cy.contains('Tuesday');
    });
});
