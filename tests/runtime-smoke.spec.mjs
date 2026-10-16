import { test, expect } from '@playwright/test';

test('Paraphrasing boots and renders every practice set without browser errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  for (let i = 1; i <= 5; i += 1) {
    await expect(page.locator(`#set${i}Container`)).toContainText('Exercise 1');
    await expect(page.locator(`#set${i}Container`)).toContainText('Exercise 4');
  }
  expect(pageErrors).toEqual([]);
});
