const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('Loading Paper Builder...');
    await page.goto('https://edulytics-question-bank.vercel.app/paper-builder', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ path: '/opt/cursor/artifacts/paper-builder-initial.png', fullPage: false });
    console.log('Initial screenshot saved');

    // Try to find and click step 2 header
    const step2Headers = await page.locator('text=/Class.*Subject/i').all();
    console.log(`Found ${step2Headers.length} step 2 headers`);
    
    if (step2Headers.length > 0) {
      await step2Headers[0].click();
      console.log('Clicked step 2');
      await page.waitForTimeout(2000);
    }

    // Look for any Select element
    const selects = await page.locator('select, [role="combobox"]').all();
    console.log(`Found ${selects.length} select elements`);

    // Try to find Board dropdown by text content
    const boardLabel = await page.locator('text=/board/i').first();
    if (await boardLabel.isVisible()) {
      console.log('Found board label');
      // Click the select trigger near the board label
      const selectTrigger = await page.locator('[role="combobox"]').first();
      if (await selectTrigger.isVisible()) {
        console.log('Clicking board dropdown...');
        await selectTrigger.click();
        await page.waitForTimeout(2000);
        
        // Check if options menu appeared
        const optionsMenu = await page.locator('[role="listbox"], [role="menu"]').first();
        if (await optionsMenu.isVisible()) {
          console.log('✓ Dropdown opened!');
          
          // Look for NCTB option
          const nctb = await page.locator('text=NCTB').first();
          if (await nctb.isVisible()) {
            console.log('✓ SUCCESS: NCTB option found - cascade is working!');
            await nctb.click();
            await page.waitForTimeout(2000);
          } else {
            console.log('✗ NCTB option not found - still broken');
          }
        } else {
          console.log('✗ Dropdown did not open - still broken');
        }
      }
    }

    await page.screenshot({ path: '/opt/cursor/artifacts/paper-builder-after-click.png', fullPage: false });
    console.log('Final screenshot saved');

  } catch (error) {
    console.error('Test error:', error.message);
    await page.screenshot({ path: '/opt/cursor/artifacts/paper-builder-error.png' });
  } finally {
    await browser.close();
  }
})();
