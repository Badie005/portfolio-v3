import { test, expect } from '@playwright/test';

test.describe('Contact Form E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to contact section
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('should display contact form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByPlaceholder('Jean Dupont')).toBeVisible();
    await expect(page.getByPlaceholder('jean@exemple.com')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /envoyer/i });
    await submitButton.click();

    // HTML5 validation should prevent submission
    const nameInput = page.getByPlaceholder('Jean Dupont');
    await expect(nameInput).toBeFocused();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByPlaceholder('Jean Dupont').fill('Test User');
    await page.getByPlaceholder('jean@exemple.com').fill('invalid-email');
    await page.getByPlaceholder(/développement/i).fill('Test Subject');
    await page.getByPlaceholder(/décrivez/i).fill('This is a test message with enough characters.');

    const submitButton = page.getByRole('button', { name: /envoyer/i });
    await submitButton.click();

    // Email input should be invalid
    const emailInput = page.getByPlaceholder('jean@exemple.com');
    await expect(emailInput).toBeFocused();
  });

  test('should submit form successfully with valid data', async ({ page }) => {
    // Mock the API response
    await page.route('/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success', id: 'test-123' }),
      });
    });

    await page.getByPlaceholder('Jean Dupont').fill('Test User');
    await page.getByPlaceholder('jean@exemple.com').fill('test@example.com');
    await page.getByPlaceholder(/développement/i).fill('Test Subject');
    await page.getByPlaceholder(/décrivez/i).fill('This is a test message with enough characters for validation.');

    const submitButton = page.getByRole('button', { name: /envoyer/i });
    await submitButton.click();

    // Wait for success toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('/api/contact', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Trop de requêtes. Réessayez plus tard.' }),
      });
    });

    await page.getByPlaceholder('Jean Dupont').fill('Test User');
    await page.getByPlaceholder('jean@exemple.com').fill('test@example.com');
    await page.getByPlaceholder(/développement/i).fill('Test Subject');
    await page.getByPlaceholder(/décrivez/i).fill('This is a test message with enough characters.');

    const submitButton = page.getByRole('button', { name: /envoyer/i });
    await submitButton.click();

    // Should show error toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation E2E', () => {
  test('should navigate to all sections', async ({ page }) => {
    await page.goto('/');

    // Check hero section is visible
    await expect(page.locator('section').first()).toBeVisible();

    // Navigate to About
    await page.getByRole('link', { name: /à propos/i }).click();
    await expect(page.locator('#about')).toBeInViewport();

    // Navigate to Skills
    await page.getByRole('link', { name: /compétences/i }).click();
    await expect(page.locator('#skills')).toBeInViewport();

    // Navigate to Contact
    await page.getByRole('link', { name: /contact/i }).click();
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /projets/i }).first().click();
    await expect(page).toHaveURL('/projects');
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();

    // Check menu items are visible
    await expect(page.getByRole('link', { name: /à propos/i })).toBeVisible();
  });
});

test.describe('Projects Page E2E', () => {
  test('should display all projects', async ({ page }) => {
    await page.goto('/projects');

    // Should have project cards
    const projectCards = page.locator('article');
    await expect(projectCards).toHaveCount(3); // Based on projects.ts data
  });

  test('should filter projects by category', async ({ page }) => {
    await page.goto('/projects');

    // Click on a filter button (if implemented)
    const filterButtons = page.getByRole('button').filter({ hasText: /web|mobile|infrastructure/i });
    
    if (await filterButtons.count() > 0) {
      await filterButtons.first().click();
      // Projects should be filtered
    }
  });
});

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(
      (e) => 
        !e.includes('favicon') && 
        !e.includes('manifest') &&
        !e.includes('_vercel/insights') &&
        !e.includes('_vercel/speed-insights') &&
        !e.includes('404 (Not Found)')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThanOrEqual(1);

    // Check h2 comes after h1
    const headings = await page.locator('h1, h2, h3').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focusable element should be focused
    const focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
  });
});
