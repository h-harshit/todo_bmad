import { test, expect } from '@playwright/test';
import { uniqueEmail, signUp, logIn } from './helpers';

test.describe('Authentication', () => {
  test('user can sign up, log out, and log back in', async ({ page }) => {
    const email = uniqueEmail('auth');

    await signUp(page, email);
    await expect(page.getByText(email)).toBeVisible();

    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await logIn(page, email);
    await expect(page.getByText(email)).toBeVisible();
  });

  test('login with wrong credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('nope@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup with existing email shows error', async ({ page }) => {
    const email = uniqueEmail('dup');
    await signUp(page, email);

    // log out so we can attempt to sign up again
    await page.getByRole('button', { name: /log out/i }).click();

    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText('Could not create account')).toBeVisible();
  });

  test('unauthenticated visit redirects to login', async ({ page }) => {
    await page.goto('/board');
    await expect(page).toHaveURL(/\/login/);
  });
});
