describe('Login Page', function() {
    it('login button should be visible', function() {
        cy.visit('http://localhost:3000');
        cy.contains('Login');
    });
    it('should login you in anonymously (in test mode)', function(){
        cy.contains('Login').click();
        cy.contains('Anonymous');
    });
});
