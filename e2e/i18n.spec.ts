import { test, expect } from "@playwright/test";

test.describe("i18n Language Switching", () => {
    test("should switch from EN to FR and update URL", async ({ page }) => {
        await page.goto("/");

        // Verify initial state is English
        await expect(page).toHaveURL("/");
        await expect(page.locator("nav")).toContainText("About");

        // Click language switcher
        await page.getByRole("button", { name: /change language/i }).click();
        await page.getByRole("option", { name: /français/i }).click();

        // Verify French state
        await expect(page).toHaveURL("/fr");
        await expect(page.locator("nav")).toContainText("À propos");
    });

    test("should switch from FR to EN and update URL", async ({ page }) => {
        await page.goto("/fr");

        // Verify initial state is French
        await expect(page).toHaveURL("/fr");
        await expect(page.locator("nav")).toContainText("À propos");

        // Click language switcher
        await page.getByRole("button", { name: /changer la langue/i }).click();
        await page.getByRole("option", { name: /english/i }).click();

        // Verify English state
        await expect(page).toHaveURL("/");
        await expect(page.locator("nav")).toContainText("About");
    });

    test("should preserve path when switching on /projects", async ({ page }) => {
        await page.goto("/projects");

        await page.getByRole("button", { name: /change language/i }).click();
        await page.getByRole("option", { name: /français/i }).click();

        // Should go to /fr/projects, not /fr/fr/projects
        await expect(page).toHaveURL("/fr/projects");
        await expect(page.locator("h1")).toContainText("Projets");
    });

    test("should not produce double locale prefix", async ({ page }) => {
        await page.goto("/fr");

        await page.getByRole("button", { name: /changer la langue/i }).click();
        await page.getByRole("option", { name: /français/i }).click();

        // Should stay at /fr, not /fr/fr
        await expect(page).toHaveURL("/fr");
    });

    test("should update nav links after language switch", async ({ page }) => {
        await page.goto("/");

        // Switch to French
        await page.getByRole("button", { name: /change language/i }).click();
        await page.getByRole("option", { name: /français/i }).click();

        // Verify all nav items are in French
        await expect(page.locator("nav")).toContainText("À propos");
        await expect(page.locator("nav")).toContainText("Projets");
        await expect(page.locator("nav")).toContainText("Compétences");
        await expect(page.locator("nav")).toContainText("Contact");
    });

    test("should preserve locale when navigating to projects", async ({ page }) => {
        await page.goto("/fr");

        // Click on projects link
        await page.getByRole("link", { name: /projets/i }).first().click();

        // Should be on /fr/projects
        await expect(page).toHaveURL("/fr/projects");
    });
});
