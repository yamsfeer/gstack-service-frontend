// Playwright E2E test - tests all main pages can be navigated to
const { chromium } = require('playwright');

async function testAllPages() {
  const shellPath = '/Users/yams/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-x64/chrome-headless-shell';
  
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: shellPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = [];
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  const routes = [
    { name: '提交工单(首页)', path: '/main/order/apply' },
    { name: '工单列表', path: '/main/order/mine' },
    { name: '审核工单', path: '/main/order/audit' },
    { name: '流程管理', path: '/main/manage' },
    { name: '服务器', path: '/main/assets/server' },
    { name: '负载均衡-集群', path: '/main/assets/balancing/cluster' },
    { name: '负载均衡-LVS', path: '/main/assets/balancing/lvs' },
    { name: '负载均衡-NAT', path: '/main/assets/balancing/nat' },
    { name: 'IP地址', path: '/main/assets/ip' },
    { name: 'DNS记录', path: '/main/assets/dns' },
    { name: '内外网映射', path: '/main/assets/map' },
  ];
  
  const results = [];
  let allPassed = true;
  
  for (const route of routes) {
    const testErrors = [];
    try {
      await page.goto('http://127.0.0.1:8080/#' + route.path, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      
      // Check for content
      const hasContent = await page.$('.app-page-content > *');
      const hasHeader = await page.$('.app-header-inner');
      const hasMenu = await page.$('.el-menu');
      const hasViteError = await page.$('vite-error-overlay');
      
      const passed = hasContent && hasHeader && hasMenu && !hasViteError;
      
      console.log(passed ? '✅' : '❌', route.name, '-', 
        `header:${!!hasHeader} menu:${!!hasMenu} content:${!!hasContent} overlay:${!!hasViteError}`);
      
      if (!passed) {
        allPassed = false;
      }
      results.push({ name: route.name, passed });
    } catch(e) {
      console.log('❌', route.name, '- ERROR:', e.message.substring(0, 80));
      results.push({ name: route.name, passed: false, error: e.message });
      allPassed = false;
    }
  }
  
  console.log('\n=== 汇总 ===');
  results.forEach(r => console.log(r.passed ? '✅' : '❌', r.name));
  
  // Summary of page errors
  const uniqueErrors = [...new Set(errors)];
  if (uniqueErrors.length > 0) {
    console.log('\n页面运行时错误:', uniqueErrors.length);
    uniqueErrors.forEach(e => console.log(' -', e.substring(0, 120)));
  }
  
  await page.screenshot({ path: '/tmp/screenshot-final.png', fullPage: true });
  console.log('📸 截图保存');
  await browser.close();
  
  return allPassed;
}

testAllPages().then(passed => {
  console.log(passed ? '\n🎉 所有测试通过！' : '\n⚠️ 部分测试未通过');
  process.exit(passed ? 0 : 1);
});
