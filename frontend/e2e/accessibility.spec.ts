import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { uniqueEmail, signUp, addTask } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function critical(violations: { impact?: string | null }[]) {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

test.describe('Accessibility (WCAG AA)', () => {
  test('login page has no critical violations', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = critical(results.violations);

    if (blocking.length) {
      console.log('Login page WCAG violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });

  test('signup mode has no critical violations', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = critical(results.violations);

    if (blocking.length) {
      console.log('Signup mode WCAG violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });

  test('empty board has no critical violations', async ({ page }) => {
    await signUp(page, uniqueEmail('a11y-empty'));

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = critical(results.violations);

    if (blocking.length) {
      console.log('Empty board WCAG violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });

  test('board with tasks has no critical violations', async ({ page }) => {
    await signUp(page, uniqueEmail('a11y-tasks'));
    await addTask(page, 'Accessible task one');
    await addTask(page, 'Accessible task two');

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = critical(results.violations);

    if (blocking.length) {
      console.log('Board WCAG violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });

  test('inline edit mode has no critical violations', async ({ page }) => {
    await signUp(page, uniqueEmail('a11y-edit'));
    await addTask(page, 'Edit me');
    await page.getByText('Edit me').click();

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = critical(results.violations);

    if (blocking.length) {
      console.log('Edit mode WCAG violations:', JSON.stringify(blocking, null, 2));
    }
    expect(blocking).toEqual([]);
  });
});
