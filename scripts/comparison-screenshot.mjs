import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:43765';
const PASSWORD = 'demo123';

async function takeComparison() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log('Taking comparison screenshot...');
    
    // Authenticate
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Skip setup
    const setupButton = await page.locator('text=Seed Database').count();
    if (setupButton > 0) {
      await page.click('button:has-text("Skip")');
      await page.waitForTimeout(1000);
    }

    // Go to questions page (similar to subjects)
    await page.goto(`${BASE_URL}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/opt/cursor/artifacts/08-questions-redesigned.png',
      fullPage: false 
    });

    console.log('✓ Comparison screenshot saved to /opt/cursor/artifacts/08-questions-redesigned.png');
    console.log('\nTo compare:');
    console.log('  Reference: /cursor/stores/bot/design-ref/academics/subjects.png');
    console.log('  Our design: /opt/cursor/artifacts/08-questions-redesigned.png');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

takeComparison().catch(console.error);
