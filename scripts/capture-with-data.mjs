import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:43765';
const PASSWORD = 'demo123';

async function captureWithData() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    console.log('1. Navigating and authenticating...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check if we're on setup screen and seed the database
    const setupButton = await page.locator('text=Seed Database').count();
    if (setupButton > 0) {
      console.log('2. Seeding database...');
      await page.click('button:has-text("Seed Database")');
      await page.waitForTimeout(5000); // Wait for seeding to complete
    } else {
      console.log('2. Database already seeded or skipped');
    }

    // Wait a bit more to ensure redirect happens
    await page.waitForTimeout(2000);

    console.log('3. Capturing screenshots with seeded data...');

    // Curriculum with actual data
    console.log('   - Curriculum with data...');
    await page.goto(`${BASE_URL}/curriculum`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Try to click on Bangladesh to expand
    const bangladeshButton = await page.locator('button:has-text("বাংলাদেশ")');
    if (await bangladeshButton.count() > 0) {
      await bangladeshButton.first().click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: '/opt/cursor/artifacts/01-curriculum-with-data.png', fullPage: false });

    // Questions with Bangla MCQ
    console.log('   - Question Bank with Bangla MCQ...');
    await page.goto(`${BASE_URL}/questions`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click on the first question to view details
    const viewButton = await page.locator('button:has-text("View")');
    if (await viewButton.count() > 0) {
      await viewButton.first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/opt/cursor/artifacts/02-bangla-mcq-with-latex.png', fullPage: false });
      // Close the dialog
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      await page.screenshot({ path: '/opt/cursor/artifacts/02-bangla-mcq-with-latex.png', fullPage: false });
    }

    // Sources with data
    console.log('   - Sources with data...');
    await page.goto(`${BASE_URL}/sources`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/opt/cursor/artifacts/07-sources-with-data.png', fullPage: false });

    console.log('\n✓ Additional screenshots with data saved!');
    console.log('  - 01-curriculum-with-data.png');
    console.log('  - 02-bangla-mcq-with-latex.png');
    console.log('  - 07-sources-with-data.png');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureWithData().catch(console.error);
