import { chromium } from 'playwright';
import { resolve } from 'path';

const baseURL = 'http://localhost:43765';
const outputDir = '/opt/cursor/artifacts';

const tabs = [
  { path: '/questions', name: 'question-bank-updated' },
  { path: '/ai-generator', name: 'ai-generator-updated' },
];

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Taking updated screenshots...\n');

  for (const tab of tabs) {
    const url = `${baseURL}${tab.path}`;
    console.log(`Navigating to ${url}...`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for content to load
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Additional wait for dynamic content and fonts
    await page.waitForTimeout(2000);
    
    const screenshotPath = resolve(outputDir, `${tab.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    console.log(`✓ Screenshot saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('\nScreenshots completed!');
}

takeScreenshots().catch((error) => {
  console.error('Error taking screenshots:', error);
  process.exit(1);
});
