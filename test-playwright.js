const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
    args: ['--proxy-server=']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('pageerror', err => console.error('❌ PAGE:', err.message));
  page.on('requestfailed', req => {
    console.error('❌ FAIL:', req.url().substring(0, 80));
  });

  console.log('正在打开 http://127.0.0.1:8080/ ...');
  try {
    await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('✅ 已加载，标题:', await page.title());
    await page.waitForTimeout(5000);
    console.log('初始化后标题:', await page.title());
    console.log('.app-container:', !!await page.$('.app-container'));
    await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
    console.log('📸 截图保存');
  } catch(e) {
    console.log('失败:', e.message);
  }
  console.log('浏览器保持打开。');
  await new Promise(() => {});
})();
