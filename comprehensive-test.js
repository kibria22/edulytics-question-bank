const { chromium } = require('playwright');
const fs = require('fs');

async function captureScreenshot(page, name) {
  await page.screenshot({ 
    path: `/opt/cursor/artifacts/${name}.png`,
    fullPage: false
  });
  console.log(`✓ Screenshot: ${name}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1200 } });
  const page = await context.newPage();
  
  const results = [];

  try {
    // TEST 1: Paper Builder cascade with defaults
    console.log('\n=== TEST 1: Paper Builder Cascade ===');
    await page.goto('https://edulytics-question-bank.vercel.app/paper-builder', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);

    // Click step 2
    await page.locator('text=/Class.*Subject/i').first().click();
    await page.waitForTimeout(1000);

    // Check if Board dropdown has NCTB preselected
    const boardButton = await page.locator('[role="combobox"]').first();
    const boardText = await boardButton.textContent();
    console.log(`Board selected: ${boardText}`);
    
    if (boardText && boardText.includes('NCTB')) {
      results.push('✓ NCTB Board preselected');
    } else {
      results.push('✗ NCTB Board NOT preselected');
    }

    await captureScreenshot(page, '1-paper-builder-step2-defaults');

    // TEST 2: Generate paper with real questions
    console.log('\n=== TEST 2: Generate Paper ===');
    await page.locator('text=/Generate/i').first().click();
    await page.waitForTimeout(5000);
    
    // Check if questions appeared in preview
    const questionText = await page.textContent('body');
    if (questionText && (questionText.includes('বহুনির্বাচনি') || questionText.includes('Multiple Choice'))) {
      results.push('✓ Real questions generated');
    } else {
      results.push('✗ No questions in preview');
    }

    await captureScreenshot(page, '2-paper-generated');

    // TEST 3: Type tabs
    console.log('\n=== TEST 3: Type Tabs ===');
    const mcqTab = await page.locator('text=/MCQ/i').first().isVisible().catch(() => false);
    const cqTab = await page.locator('text=/CQ/i').first().isVisible().catch(() => false);
    
    if (mcqTab) {
      results.push('✓ MCQ tab visible');
      await page.locator('text=/MCQ/i').first().click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '3-mcq-tab');
    } else {
      results.push('✗ MCQ tab not found');
    }

    if (cqTab) {
      results.push('✓ CQ tab visible');
      await page.locator('text=/CQ/i').first().click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '4-cq-tab');
    } else {
      results.push('✗ CQ tab not found');
    }

    // TEST 4: MCQ Layout selector
    console.log('\n=== TEST 4: MCQ Layouts ===');
    const settingsBtn = await page.locator('text=/Settings|Layouts/i').first().isVisible().catch(() => false);
    if (settingsBtn) {
      await page.locator('text=/Settings|Layouts/i').first().click();
      await page.waitForTimeout(500);
      results.push('✓ Layout settings accessible');
      await captureScreenshot(page, '5-layout-settings');
    }

    // TEST 5: Question Bank
    console.log('\n=== TEST 5: Question Bank ===');
    await page.goto('https://edulytics-question-bank.vercel.app/questions', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);

    // Check for left rail
    const leftRail = await page.locator('text=/Board/i').first().isVisible().catch(() => false);
    if (leftRail) {
      results.push('✓ Left filter rail visible');
    } else {
      results.push('✗ Left filter rail not found');
    }

    await captureScreenshot(page, '6-question-bank-with-rail');

    // TEST 6: Show Answers toggle
    console.log('\n=== TEST 6: Show Answers ===');
    const answersBtn = await page.locator('text=/Show Answers/i').first();
    if (await answersBtn.isVisible()) {
      await answersBtn.click();
      await page.waitForTimeout(2000);
      results.push('✓ Show Answers toggle works');
      await captureScreenshot(page, '7-answers-visible');
    } else {
      results.push('✗ Show Answers button not found');
    }

    // TEST 7: Detail drawer
    console.log('\n=== TEST 7: Detail Drawer ===');
    const viewDetailsBtn = await page.locator('text=/View Details/i').first();
    if (await viewDetailsBtn.isVisible()) {
      await viewDetailsBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if drawer opened
      const drawerVisible = await page.locator('text=/Question Details/i').isVisible().catch(() => false);
      if (drawerVisible) {
        results.push('✓ Detail drawer opens');
        await captureScreenshot(page, '8-detail-drawer');
        
        // Check tabs
        const solutionsTab = await page.locator('text=/Solutions/i').first().isVisible().catch(() => false);
        if (solutionsTab) {
          await page.locator('text=/Solutions/i').first().click();
          await page.waitForTimeout(1000);
          results.push('✓ Solutions tab accessible');
          await captureScreenshot(page, '9-solutions-tab');
        }
      } else {
        results.push('✗ Detail drawer did not open');
      }
    }

    console.log('\n=== TEST RESULTS ===');
    results.forEach(r => console.log(r));

  } catch (error) {
    console.error('Test error:', error.message);
    results.push(`✗ Error: ${error.message}`);
    await captureScreenshot(page, 'error');
  } finally {
    // Write results to file
    fs.writeFileSync('/opt/cursor/artifacts/test-results.txt', results.join('\n'));
    await browser.close();
  }
})();
