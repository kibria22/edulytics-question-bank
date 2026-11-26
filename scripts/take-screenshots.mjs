import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:43765';
const PASSWORD = 'demo123';

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating to home page...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    console.log('2. Authenticating...');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check if we're on setup screen
    const setupButton = await page.locator('text=Seed Database').count();
    if (setupButton > 0) {
      console.log('3. Skipping setup (no DB)...');
      await page.click('button:has-text("Skip")');
      await page.waitForTimeout(1000);
    }

    console.log('4. Taking screenshots of all tabs...');

    // Tab 1: Curriculum
    console.log('   - Curriculum Browser...');
    await page.goto(`${BASE_URL}/curriculum`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/opt/cursor/artifacts/01-curriculum-browser.png', fullPage: false });

    // Tab 2: Questions
    console.log('   - Question Bank...');
    await page.goto(`${BASE_URL}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/opt/cursor/artifacts/02-question-bank.png', fullPage: false });

    // Tab 3: Editor
    console.log('   - Question Editor...');
    await page.goto(`${BASE_URL}/editor`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Just take screenshot as-is
    await page.screenshot({ path: '/opt/cursor/artifacts/03-question-editor.png', fullPage: false });

    // Tab 4: AI Generator
    console.log('   - AI Generator...');
    await page.goto(`${BASE_URL}/ai-generator`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/opt/cursor/artifacts/04-ai-generator.png', fullPage: false });

    // Tab 5: Solutions
    console.log('   - Solutions & Hints...');
    await page.goto(`${BASE_URL}/solutions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/opt/cursor/artifacts/05-solutions-hints.png', fullPage: false });

    // Tab 6: Paper Builder
    console.log('   - Paper Builder...');
    await page.goto(`${BASE_URL}/paper-builder`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/opt/cursor/artifacts/06-paper-builder.png', fullPage: false });

    // Tab 7: Sources
    console.log('   - Sources...');
    await page.goto(`${BASE_URL}/sources`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/opt/cursor/artifacts/07-sources.png', fullPage: false });

    console.log('\n✓ All screenshots saved to /opt/cursor/artifacts/');
    console.log('  - 01-curriculum-browser.png');
    console.log('  - 02-question-bank.png');
    console.log('  - 03-question-editor.png');
    console.log('  - 04-ai-generator.png');
    console.log('  - 05-solutions-hints.png');
    console.log('  - 06-paper-builder.png');
    console.log('  - 07-sources.png');

  } catch (error) {
    console.error('Error taking screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error);
