import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1200 },
  });
  const page = await context.newPage();

  try {
    console.log('Loading Paper Builder...');
    await page.goto('http://localhost:3000/paper-builder', { waitUntil: 'networkidle' });
    
    // Wait for initial load and auto-generation
    await page.waitForTimeout(8000);

    // 1. Initial state with defaults and generated paper
    console.log('Screenshot 1: Generated paper with defaults...');
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-01-generated-with-defaults.png',
      fullPage: true,
    });

    // 2. Scroll to see the preview better
    await page.evaluate(() => {
      window.scrollTo(0, 300);
    });
    await page.waitForTimeout(500);
    console.log('Screenshot 2: Preview detail...');
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-02-preview-detail.png',
      fullPage: false,
    });

    // 3. Click on step 4 to show question mix config
    console.log('Screenshot 3: Opening step 4...');
    await page.click('text=প্রশ্ন ও সময়');
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-03-step4-question-mix.png',
      fullPage: true,
    });

    // 4. Show summary card
    console.log('Screenshot 4: Summary card detail...');
    await page.evaluate(() => {
      const summary = document.querySelector('div:has-text("সংক্ষিপ্ত বিবরণ")');
      if (summary) summary.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-04-summary-card.png',
      fullPage: false,
    });

    // 5. Show MCQ section in preview
    console.log('Screenshot 5: MCQ section detail...');
    await page.click('div.flex-1.overflow-y-auto');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const preview = document.querySelector('div.bg-white.shadow-xl');
      if (preview) preview.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-05-mcq-section.png',
      fullPage: false,
    });

    // 6. Scroll to CQ section
    console.log('Screenshot 6: CQ section detail...');
    await page.evaluate(() => {
      const cqSection = Array.from(document.querySelectorAll('h3'))
        .find(el => el.textContent.includes('সৃজনশীল'));
      if (cqSection) cqSection.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-06-cq-section.png',
      fullPage: false,
    });

    // 7. Show edit controls
    console.log('Screenshot 7: Edit controls (বদলাও/ভুল রিপোর্ট)...');
    await page.evaluate(() => {
      const firstQuestion = document.querySelector('div.relative.group');
      if (firstQuestion) firstQuestion.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(500);
    // Hover over a question to show edit controls
    const firstQuestion = await page.locator('div.relative.group').first();
    await firstQuestion.hover();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-07-edit-controls.png',
      fullPage: false,
    });

    // 8. Toggle edit mode off (print preview)
    console.log('Screenshot 8: Print preview (edit mode off)...');
    await page.click('button:has-text("এডিট মোড")');
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const preview = document.querySelector('div.bg-white.shadow-xl');
      if (preview) preview.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-08-print-preview.png',
      fullPage: true,
    });

    // 9. Full page overview
    console.log('Screenshot 9: Full page overview...');
    await page.click('button:has-text("এডিট মোড")'); // Turn edit mode back on
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/opt/cursor/artifacts/pb-09-full-overview.png',
      fullPage: true,
    });

    console.log('\n✅ All screenshots captured successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
