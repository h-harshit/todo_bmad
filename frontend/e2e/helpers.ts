import { Page, expect } from '@playwright/test';

export const uniqueEmail = (prefix = 'e2e') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;

export async function signUp(page: Page, email: string, password = 'password123') {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/\/board/);
}

export async function logIn(page: Page, email: string, password = 'password123') {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/board/);
}

export async function addTask(page: Page, title: string) {
  await page.getByPlaceholder('+ Add a task').fill(title);
  await page.getByPlaceholder('+ Add a task').press('Enter');
  await expect(page.getByText(title)).toBeVisible();
}
