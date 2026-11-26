import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Set up demo mode (skip authentication)
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.setItem('app_authenticated', 'true');
    });

    // Take Dashboard screenshot
    console.log('Taking Dashboard screenshot...');
    await page.goto('http://localhost:3000/curriculum', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/dashboard-with-filters.png',
      fullPage: true,
    });
    console.log('Dashboard screenshot saved');

    // Take Question Bank screenshot
    console.log('Taking Question Bank screenshot...');
    await page.goto('http://localhost:3000/questions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/question-bank-with-filters.png',
      fullPage: true,
    });
    console.log('Question Bank screenshot saved');

    // Take Paper Builder screenshot
    console.log('Taking Paper Builder screenshot...');
    await page.goto('http://localhost:3000/paper-builder', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-with-filters.png',
      fullPage: true,
    });
    console.log('Paper Builder screenshot saved');

    // Take Paper Builder with question picker
    console.log('Taking Paper Builder question picker screenshot...');
    await page.click('button:has-text("Pick Questions")');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-question-picker.png',
      fullPage: true,
    });
    console.log('Paper Builder question picker screenshot saved');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);
