describe('Login Page', function() {
    beforeEach(function(){
        cy.on('uncaught:exception', (err, runnable) => {
            // ignore uncaught exceptions. just proceed.
            return true;
        });
        cy.visit('http://localhost:3000');
    });
    it('login button should be visible', function() {
        cy.contains('Login');
    });
    it('should login you in anonymously (in test mode)', function(){
        cy.contains('Login').click();
        cy.contains('Anonymous');
    });
});
