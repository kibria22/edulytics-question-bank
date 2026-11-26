import { chromium } from 'playwright';
import { resolve } from 'path';

const baseURL = 'http://localhost:43765';
const outputDir = '/opt/cursor/artifacts';

const tabs = [
  { path: '/curriculum', name: 'curriculum-browser' },
  { path: '/questions', name: 'question-bank' },
  { path: '/editor', name: 'question-editor' },
  { path: '/ai-generator', name: 'ai-generator' },
  { path: '/solutions', name: 'solutions-hints' },
  { path: '/paper-builder', name: 'paper-builder' },
  { path: '/sources', name: 'sources' },
];

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Taking screenshots of all 7 tabs...\n');

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
  console.log('\nAll screenshots completed!');
}

takeScreenshots().catch((error) => {
  console.error('Error taking screenshots:', error);
  process.exit(1);
});
