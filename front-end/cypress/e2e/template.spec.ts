/// <reference types="cypress" />

context("Content pages", () => {
	beforeEach(() => {
		cy.visit("/"); // baseUrl configured in cypress.config.ts
	});

	it("hero CTA leads to projects with rendered cards", () => {
		cy.contains("View projects").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/projects`);
		cy.contains("Projects").should("exist");
		cy.get(".project-card").its("length").should("be.greaterThan", 0);
	});

	it("experience page lists timeline entries", () => {
		cy.visit("/experience");
		cy.contains("Experience").should("exist");
		cy.get(".entry").its("length").should("be.greaterThan", 1);
		cy.get(".entry")
			.first()
			.within(() => {
				cy.contains("Instructor").should("exist");
			});
	});

	it("contact page shows ways to reach out", () => {
		cy.visit("/contact");
		cy.contains("Open to thoughtful conversations and well-scoped work.").should("exist");
		cy.contains("jacobdanderson@gmail.com").should("exist");
		cy.contains("View teaching options").should("exist");
	});
});
