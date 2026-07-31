// E2E 冒烟测试：验证所有模块页面可加载且无运行时错误
const { test, expect } = require('@playwright/test');

const routes = [
  { name: '提交工单', path: '/main/order/apply' },
  { name: '工单列表', path: '/main/order/mine' },
  { name: '审核工单', path: '/main/order/audit' },
  { name: '流程管理', path: '/main/manage' },
  { name: '服务器', path: '/main/assets/server' },
  { name: '集群', path: '/main/assets/balancing/cluster' },
  { name: 'LVS', path: '/main/assets/balancing/lvs' },
  { name: 'NAT', path: '/main/assets/balancing/nat' },
  { name: 'IP地址', path: '/main/assets/ip' },
  { name: 'DNS记录', path: '/main/assets/dns' },
  { name: '内外网映射', path: '/main/assets/map' },
];

for (const route of routes) {
  test(`页面可访问: ${route.name}`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto(`/#${route.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 菜单与内容渲染
    await expect(page.locator('.app-header-inner')).toBeVisible();
    await expect(page.locator('.side-nav-menu')).toBeVisible();
    await expect(page.locator('.app-page-content > *').first()).toBeVisible();

    // 无运行时错误（Element Plus 弃用警告不计入）
    const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
    expect(realErrors).toEqual([]);
  });
}
