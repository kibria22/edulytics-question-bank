import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1200 },
  });
  const page = await context.newPage();

  try {
    // Load Paper Builder in English (default)
    console.log('Loading Paper Builder in English...');
    await page.goto('http://localhost:3000/paper-builder', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000); // Wait for auto-generation

    // English screenshots
    console.log('Screenshot: English Paper Builder');
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-english.png',
      fullPage: true,
    });

    // Switch to Bengali
    console.log('Switching to Bengali...');
    await page.click('button:has(svg)'); // Click globe icon
    await page.waitForTimeout(500);
    await page.click('text=বাংলা');
    await page.waitForTimeout(1000);

    // Bengali screenshots
    console.log('Screenshot: Bengali Paper Builder');
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-bengali.png',
      fullPage: true,
    });

    // Check Question Bank in English
    await page.click('text=English');
    await page.waitForTimeout(500);
    await page.goto('http://localhost:3000/questions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('Screenshot: English Question Bank');
    await page.screenshot({
      path: '/opt/cursor/artifacts/question-bank-english.png',
      fullPage: true,
    });

    // Switch to Bengali for Question Bank
    await page.click('button[class*="justify-center"]'); // Globe button
    await page.waitForTimeout(500);
    await page.click('text=বাংলা');
    await page.waitForTimeout(1000);

    console.log('Screenshot: Bengali Question Bank');
    await page.screenshot({
      path: '/opt/cursor/artifacts/question-bank-bengali.png',
      fullPage: true,
    });

    console.log('\n✅ All i18n screenshots captured!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
