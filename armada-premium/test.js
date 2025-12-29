const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing ARMADA Premium System...');

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    // Navigate to the application
    const response = await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log(`Page loaded with status: ${response.status()}`);

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for main content
    const bodyText = await page.textContent('body');
    const hasContent = bodyText && bodyText.trim().length > 0;
    console.log(`Page has content: ${hasContent}`);

    // Report console errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    if (errors.length > 0) {
      console.log('Console errors found:');
      errors.forEach(err => console.log(`  - ${err.text}`));
    } else {
      console.log('No console errors detected');
    }

    // Report page errors
    if (pageErrors.length > 0) {
      console.log('Page errors found:');
      pageErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('No page errors detected');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
