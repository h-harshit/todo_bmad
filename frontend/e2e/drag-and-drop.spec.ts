import { test, expect, Page } from '@playwright/test';
import { uniqueEmail, signUp, addTask } from './helpers';

/**
 * HTML5 native drag-and-drop is not driven correctly by Playwright's
 * default mouse events, so we dispatch the drag/drop events ourselves
 * with a shared DataTransfer-like payload.
 */
async function dragCardToColumn(page: Page, taskTitle: string, columnAccent: 'gray' | 'blue' | 'green') {
  await page.evaluate(
    ({ title, accent }) => {
      const card = Array.from(document.querySelectorAll<HTMLElement>('[draggable="true"]'))
        .find((el) => el.textContent?.includes(title));
      const column = document.querySelector<HTMLElement>(`[class*="border-t-${accent}"]`);
      if (!card) throw new Error(`drag source not found for title "${title}"`);
      if (!column) throw new Error(`drop target not found for accent "${accent}"`);

      const dt = new DataTransfer();
      card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      column.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: dt }));
      column.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
      column.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
      card.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    },
    { title: taskTitle, accent: columnAccent }
  );
}

test.describe('Drag and drop', () => {
  test('drag a task from To do to In progress', async ({ page }) => {
    await signUp(page, uniqueEmail('dnd-1'));
    await addTask(page, 'Move me to in progress');

    await dragCardToColumn(page, 'Move me to in progress', 'blue');

    const inProgressColumn = page.locator('[class*="border-t-blue"]');
    await expect(inProgressColumn.getByText('Move me to in progress')).toBeVisible();

    const todoColumn = page.locator('[class*="border-t-gray"]').first();
    await expect(todoColumn.getByText('Move me to in progress')).not.toBeVisible();
  });

  test('drag a task all the way to Done', async ({ page }) => {
    await signUp(page, uniqueEmail('dnd-2'));
    await addTask(page, 'Ship it');

    await dragCardToColumn(page, 'Ship it', 'green');

    const doneColumn = page.locator('[class*="border-t-green"]');
    await expect(doneColumn.getByText('Ship it')).toBeVisible();
  });

  test('drag back from Done to In progress', async ({ page }) => {
    await signUp(page, uniqueEmail('dnd-3'));
    await addTask(page, 'Reopened task');

    await dragCardToColumn(page, 'Reopened task', 'green');
    await expect(page.locator('[class*="border-t-green"]').getByText('Reopened task')).toBeVisible();

    await dragCardToColumn(page, 'Reopened task', 'blue');
    await expect(page.locator('[class*="border-t-blue"]').getByText('Reopened task')).toBeVisible();
  });

  test('column count badge updates after drop', async ({ page }) => {
    await signUp(page, uniqueEmail('dnd-4'));
    await addTask(page, 'Counts');

    const todoColumn = page.locator('[class*="border-t-gray"]').first();
    const inProgressColumn = page.locator('[class*="border-t-blue"]');

    await expect(todoColumn.locator('span', { hasText: /^1$/ })).toBeVisible();

    await dragCardToColumn(page, 'Counts', 'blue');

    await expect(inProgressColumn.locator('span', { hasText: /^1$/ })).toBeVisible();
    await expect(todoColumn.locator('span', { hasText: /^0$/ })).toBeVisible();
  });
});
