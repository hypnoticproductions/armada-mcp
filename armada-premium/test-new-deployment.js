const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Testing NEW deployment...');

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  // Collect request failures
  const requestFailures = [];
  page.on('requestfailed', request => {
    requestFailures.push(`${request.url().split('/').pop()} - ${request.failure().errorText}`);
  });

  try {
    console.log('Navigating to https://ylgsei4eqyc1.space.minimax.io...');
    const response = await page.goto('https://ylgsei4eqyc1.space.minimax.io', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log(`Status: ${response.status()}`);
    console.log(`Title: ${await page.title()}`);

    // Wait for content to render
    await page.waitForTimeout(5000);

    // Check for static file loading
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const jsErrors = errors.filter(e => e.text.includes('Failed to load resource'));

    if (requestFailures.length > 0) {
      console.log('\n❌ Static file failures:');
      requestFailures.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ All static files loaded successfully!');
    }

    // Get page content preview
    const bodyText = await page.evaluate(() => ({
      text: document.body.innerText.substring(0, 800),
      hasARMADA: document.body.innerText.includes('ARMADA'),
      hasSongEngine: document.body.innerText.includes('Song Engine'),
      hasValidation: document.body.innerText.includes('Validation')
    }));

    console.log('\n📄 Page content check:');
    console.log(`  ✓ ARMADA content: ${bodyText.hasARMADA}`);
    console.log(`  ✓ Song Engine: ${bodyText.hasSongEngine}`);
    console.log(`  ✓ Validation: ${bodyText.hasValidation}`);
    console.log('\n📝 Content preview:');
    console.log(bodyText.text);

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
