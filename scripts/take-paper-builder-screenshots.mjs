import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
  });
  const page = await context.newPage();

  try {
    // Initial Paper Builder view
    console.log('Taking Paper Builder initial view...');
    await page.goto('http://localhost:3000/paper-builder', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-new-initial.png',
      fullPage: true,
    });
    console.log('Initial view saved');

    // Fill step 1
    console.log('Filling step 1...');
    await page.click('button:has-text("পরীক্ষার প্রশ্নপত্র")');
    await page.fill('input[placeholder*="অর্ধবার্ষিক"]', 'অর্ধবার্ষিক পরীক্ষা ২০২৪');
    await page.fill('input[placeholder*="ঢাকা আদর্শ"]', 'ঢাকা আদর্শ উচ্চ বিদ্যালয়');
    await page.fill('input[placeholder="১৮০"]', '180');
    await page.fill('input[placeholder="১০০"]', '100');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("পরবর্তী")');
    await page.waitForTimeout(1000);

    // Fill step 2 - Select curriculum
    console.log('Filling step 2...');
    // Click on the board dropdown
    const boardDropdown = page.locator('label:has-text("বোর্ড")').locator('..').locator('button').first();
    await boardDropdown.click();
    await page.waitForTimeout(500);
    // Select first board
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1000);
    
    // Select class
    const classDropdown = page.locator('label:has-text("শ্রেণি")').locator('..').locator('button').first();
    await classDropdown.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1000);

    // Select subject (might need group first)
    const subjectDropdown = page.locator('label:has-text("বিষয়")').locator('..').locator('button').first();
    if (await subjectDropdown.isVisible()) {
      await subjectDropdown.click();
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(1000);
    }

    await page.click('button:has-text("পরবর্তী")');
    await page.waitForTimeout(1000);

    // Fill step 3 - Select chapters
    console.log('Filling step 3...');
    await page.click('input[type="checkbox"]:near(text="সব অধ্যায়")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("পরবর্তী")');
    await page.waitForTimeout(1000);

    // Fill step 4 - Add sections
    console.log('Filling step 4...');
    // The first section is auto-added, let's configure it
    // Update the title of first section
    const firstSectionTitle = page.locator('input[placeholder="সেকশন শিরোনাম"]').first();
    await firstSectionTitle.fill('বহুনির্বাচনি প্রশ্ন');
    await page.waitForTimeout(500);

    // Add another section
    await page.click('button:has-text("সেকশন যোগ করুন")');
    await page.waitForTimeout(1000);
    
    // Update second section
    const secondSectionTitle = page.locator('input[placeholder="সেকশন শিরোনাম"]').nth(1);
    await secondSectionTitle.fill('সৃজনশীল প্রশ্ন');
    await page.waitForTimeout(500);
    
    // Change type to CQ for second section
    const secondSectionType = page.locator('label:has-text("ধরন")').nth(1).locator('..').locator('button').first();
    await secondSectionType.click();
    await page.waitForTimeout(500);
    await page.locator('[role="option"]:has-text("সৃজনশীল")').click();
    await page.waitForTimeout(500);

    // Update question count for second section
    const secondSectionCount = page.locator('label:has-text("প্রশ্ন সংখ্যা")').nth(1).locator('..').locator('input');
    await secondSectionCount.fill('5');
    await page.waitForTimeout(500);

    // Update marks for second section
    const secondSectionMarks = page.locator('label:has-text("প্রতিটি নম্বর")').nth(1).locator('..').locator('input');
    await secondSectionMarks.fill('10');
    await page.waitForTimeout(1000);

    // Take screenshot of configured state
    console.log('Taking configured state screenshot...');
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-new-configured.png',
      fullPage: true,
    });
    console.log('Configured state saved');

    // Click generate button
    console.log('Generating paper...');
    await page.click('button:has-text("প্রশ্নপত্র তৈরি করুন")');
    await page.waitForTimeout(5000); // Wait for generation

    // Take screenshot of generated paper
    console.log('Taking generated paper screenshot...');
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-new-generated.png',
      fullPage: true,
    });
    console.log('Generated paper saved');

    // Scroll to preview section and take detailed preview screenshot
    console.log('Taking preview detail screenshot...');
    await page.evaluate(() => {
      const preview = document.querySelector('div.bg-white.shadow-lg');
      if (preview) preview.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/paper-builder-new-preview-detail.png',
      fullPage: false,
    });
    console.log('Preview detail saved');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
