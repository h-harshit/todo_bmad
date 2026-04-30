import { test, expect } from '@playwright/test';
import { uniqueEmail, signUp, addTask } from './helpers';

test.describe('Task management', () => {
  test('user can create a task in the To do column', async ({ page }) => {
    await signUp(page, uniqueEmail('create'));

    await addTask(page, 'Buy groceries');

    const todoColumn = page.locator('[class*="border-t-gray"]').first();
    await expect(todoColumn.getByText('Buy groceries')).toBeVisible();
  });

  test('user can edit a task title inline', async ({ page }) => {
    await signUp(page, uniqueEmail('edit'));
    await addTask(page, 'Original title');

    await page.getByText('Original title').click();
    const input = page.locator('input').filter({ hasNot: page.locator('[type="email"], [type="password"]') }).first();
    await input.fill('Updated title');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Updated title')).toBeVisible();
    await expect(page.getByText('Original title')).not.toBeVisible();
  });

  test('user can delete a task with confirmation', async ({ page }) => {
    await signUp(page, uniqueEmail('delete'));
    await addTask(page, 'Task to delete');

    const card = page.locator('[draggable="true"]').filter({ hasText: 'Task to delete' });
    await card.hover();
    await card.getByTitle('More options').click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    // Confirmation modal: "Delete task?" + Cancel / Delete buttons
    const modal = page.getByText('Delete task?').locator('..');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Task to delete')).not.toBeVisible();
  });

  test('cancelling delete keeps the task', async ({ page }) => {
    await signUp(page, uniqueEmail('cancel-delete'));
    await addTask(page, 'Keep me');

    const card = page.locator('[draggable="true"]').filter({ hasText: 'Keep me' });
    await card.hover();
    await card.getByTitle('More options').click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    const modal = page.getByText('Delete task?').locator('..');
    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText('Delete task?')).not.toBeVisible();
    await expect(page.getByText('Keep me')).toBeVisible();
  });

  test('empty board shows empty state in every column', async ({ page }) => {
    await signUp(page, uniqueEmail('empty'));

    const empty = page.getByText('No tasks');
    await expect(empty).toHaveCount(3);
  });

  test('tasks persist across page reloads', async ({ page }) => {
    const email = uniqueEmail('persist');
    await signUp(page, email);
    await addTask(page, 'Survives a refresh');

    await page.reload();
    await expect(page.getByText('Survives a refresh')).toBeVisible();
  });
});
