describe('Navbar', function() {
    beforeEach(function(){
        cy.on('uncaught:exception', function(err, runnable) {
            expect(err.message).to.include("Cannot read property 'getBoundingClientRect' of null");
            return false;
        });
    });
    it('should goto calories', function() {
        cy.visit('http://localhost:3000');
        cy.contains('Login').click();

        cy.get('.calories-nav-btn').click();
        cy.contains("Weight on");
        cy.contains("Consumed Foods");
    });
    it('should goto todos', function(){
        cy.get('.todo-nav-btn').click();
        cy.contains("Example Todo 1");
    });
    it('should goto notes', function() {
        cy.get('.notes-nav-btn').click();
        cy.contains('An example note');
    });
    it('should goto schedule', function(){
        cy.get('.schedule-nav-btn').click();
        cy.contains('Monday');
        cy.contains('Tuesday');
    });
});
