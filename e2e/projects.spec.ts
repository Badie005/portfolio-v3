import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
        await page.goto('/projects');
        // Wait for page hydration and initial animations to complete
        await page.waitForLoadState('networkidle');
    });

    test('should display the projects page title', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Projets', level: 1 })).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Une sélection de projets qui reflètent mon approche du développement.')).toBeVisible();
    });

    test('should display project cards', async ({ page }) => {
        // Wait for animations to complete
        await page.waitForTimeout(1000);

        // Check if there are any project articles
        const projects = page.locator('article');
        await expect(projects).not.toHaveCount(0);

        // Check first project content (h3 heading inside ProjectCard)
        const firstProject = projects.first();
        await expect(firstProject.getByRole('heading', { level: 3 })).toBeVisible({ timeout: 10000 });

        // ProjectCard GitHub button uses aria-label, not visible text
        // Check that the link wrapper exists instead
        await expect(firstProject.getByRole('link').first()).toBeVisible();
    });

    test('should have valid links', async ({ page }) => {
        // Wait for animations to complete
        await page.waitForTimeout(1000);

        const firstProject = page.locator('article').first();
        const link = firstProject.getByRole('link').first();

        await expect(link).toHaveAttribute('href', /\/projects\/.+/);
    });

    test('should show CTA at the bottom', async ({ page }) => {
        // Scroll to the bottom to ensure CTA is in viewport and animations triggered
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        // Wait for Framer Motion animations (CTA has delay: 0.5)
        await page.waitForTimeout(1500);

        await expect(page.getByText('Intéressé par une collaboration ?')).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('link', { name: 'Démarrer un projet' })).toBeVisible({ timeout: 10000 });
    });
});
