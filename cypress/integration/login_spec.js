describe('Login Page', function() {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
    })
    it('login button should be visible', function() {
        cy.contains('Login');
    });
    it('should login you in anonymously (in test mode)', function(){
        cy.contains('Login').click();
        cy.contains('Anonymous');
    });

});
