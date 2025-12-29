context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});
	
	it("shows the home hero", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);
		
		cy.contains("Jacob Anderson").should("exist");
		cy.contains("Cofounder & educator").should("exist");
		cy.contains("View projects").should("exist");
	});
	
	it("navigates to About", () => {
		cy.contains("About").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);
		
		cy.contains("About Jacob").should("exist");
		cy.contains("Technical toolkit").should("exist");
	});
});
