import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
  });
  const page = await context.newPage();

  try {
    console.log('Opening Paper Builder...');
    await page.goto('http://localhost:3000/paper-builder', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('\n=== Manual Test Instructions ===');
    console.log('1. Fill in "অর্ধবার্ষিক পরীক্ষা ২০২৪" for paper title');
    console.log('2. Fill in "ঢাকা আদর্শ উচ্চ বিদ্যালয়" for school name');
    console.log('3. Fill in 180 for duration and 100 for full marks');
    console.log('4. Click পরবর্তী to go to step 2');
    console.log('5. Select Board, Class, and Subject');
    console.log('6. Click পরবর্তী to go to step 3');
    console.log('7. Select "সব অধ্যায়"');
    console.log('8. Click পরবর্তী to go to step 4');
    console.log('9. Configure sections (MCQ 25×1, CQ 5×10)');
    console.log('10. Click "প্রশ্নপত্র তৈরি করুন"');
    console.log('11. Wait for generation and view the preview');
    console.log('\nPress Ctrl+C when done reviewing...');
    
    // Keep browser open for manual testing
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
