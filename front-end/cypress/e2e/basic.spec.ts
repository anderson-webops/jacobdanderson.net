context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("shows the home hero", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);

		cy.contains("Professional Portfolio").should("exist");
		cy.contains("Computer Engineer, Cofounder, and Educator").should("exist");
		cy.contains("View projects").should("exist");
	});

	it("navigates to About", () => {
		cy.contains("About").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);

		cy.contains("Systems-minded engineering with a strong emphasis on clarity.").should("exist");
		cy.contains("Technical toolkit").should("exist");
	});
});
