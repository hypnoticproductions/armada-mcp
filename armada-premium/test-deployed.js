const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing deployed ARMADA Premium System...');

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

  // Collect request failures
  const requestFailures = [];
  page.on('requestfailed', request => {
    requestFailures.push(`${request.url()} - ${request.failure().errorText}`);
  });

  try {
    // Navigate to the deployed application
    console.log('Navigating to https://8lwvr41e8phy.space.minimax.io...');
    const response = await page.goto('https://8lwvr41e8phy.space.minimax.io', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log(`Page loaded with status: ${response.status()}`);

    // Wait for JavaScript to execute
    await page.waitForTimeout(5000);

    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for visible content
    const bodyContent = await page.content();
    const hasVisibleContent = bodyContent.includes('ARMADA') || bodyContent.includes('Dashboard') || bodyContent.includes('Song');
    console.log(`Page has ARMADA content: ${hasVisibleContent}`);

    // Report console errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    if (errors.length > 0) {
      console.log('\n❌ Console errors found:');
      errors.forEach(err => console.log(`  - ${err.text.substring(0, 200)}`));
    } else {
      console.log('\n✅ No console errors detected');
    }

    // Report page errors
    if (pageErrors.length > 0) {
      console.log('\n❌ Page errors found:');
      pageErrors.forEach(err => console.log(`  - ${err.substring(0, 200)}`));
    } else {
      console.log('✅ No page errors detected');
    }

    // Report request failures
    if (requestFailures.length > 0) {
      console.log('\n❌ Request failures:');
      requestFailures.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ No request failures');
    }

    // Get page screenshot for debugging
    console.log('\n📸 Page structure preview:');
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(bodyText);

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
