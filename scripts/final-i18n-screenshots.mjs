import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1200 },
  });
  const page = await context.newPage();

  try {
    console.log('1. Paper Builder in English UI with Bangla paper...');
    await page.goto('http://localhost:3000/paper-builder', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000); // Wait for auto-generation
    
    await page.screenshot({
      path: '/opt/cursor/artifacts/final-pb-english-ui-bangla-paper.png',
      fullPage: true,
    });
    console.log('   ✓ Saved');

    console.log('2. Switch to Bengali UI...');
    // Click globe button more reliably
    await page.click('div.flex.items-center.gap-3 >> button:nth-child(4)');
    await page.waitForTimeout(1000);
    
    // Try clicking বাংলা option
    try {
      await page.click('text=বাংলা', { timeout: 5000 });
      await page.waitForTimeout(1500);
      
      await page.screenshot({
        path: '/opt/cursor/artifacts/final-pb-bengali-ui.png',
        fullPage: true,
      });
      console.log('   ✓ Saved Bengali UI');
    } catch (e) {
      console.log('   ⚠ Could not switch to Bengali UI:', e.message);
    }

    console.log('3. Dashboard in English...');
    // Reset to English
    await page.evaluate(() => {
      localStorage.setItem('edulytics_ui_lang', 'en');
    });
    
    await page.goto('http://localhost:3000/curriculum', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: '/opt/cursor/artifacts/final-dashboard-english.png',
      fullPage: true,
    });
    console.log('   ✓ Saved');

    console.log('\n✅ All screenshots captured!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
