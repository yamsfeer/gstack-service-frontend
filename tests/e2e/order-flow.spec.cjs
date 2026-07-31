// ============================================================
// E2E：工单全流程（用户故事）
// 管理员提交虚拟机工单 → 列表可见 → 审核同意 → 开通配置 → 完成
// ============================================================
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // 重置 mock 状态
  await page.request.post('http://127.0.0.1:8000/__mock/reset');
});

async function resetPage(page, path) {
  await page.goto(`/#${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
}

async function selectElOption(page, selectIndex, label) {
  await page.locator('.el-select').nth(selectIndex).click();
  await page.waitForTimeout(300);
  await page.locator('.el-select-dropdown__item', { hasText: label }).first().click();
  await page.waitForTimeout(300);
}

test('用户故事：提交虚拟机工单并在列表可见', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 首页展示 5 种工单类型
  await resetPage(page, '/main/order/apply');
  await expect(page.getByText('请选择工单分类')).toBeVisible();
  await expect(page.getByText('云主机服务')).toBeVisible();

  // 2. 进入虚拟机申请表单
  await page.getByRole('link', { name: '提交工单' }).first().click();
  await page.waitForTimeout(800);
  await expect(page.getByText('创建工单')).toBeVisible();

  // 3. 填写表单
  await selectElOption(page, 0, '平台研发部'); // 所属租户
  await page.getByText('测试', { exact: true }).first().click(); // 业务等级
  await selectElOption(page, 1, '产品线A'); // 产品
  await page.getByText('1个月', { exact: true }).click(); // 过期时间
  // 系统模板
  await selectElOption(page, 2, 'CentOS'); // template_type
  await page.waitForTimeout(300);
  await selectElOption(page, 3, 'CentOS 7.9'); // os_name
  // 申请理由
  await page.locator('textarea').first().fill('E2E 测试虚拟机申请');

  // 4. 提交
  await page.getByRole('button', { name: '提交' }).click();
  await page.waitForTimeout(1200);
  // 弹确认框
  await expect(page.getByText('创建工单成功！')).toBeVisible();
  await page.getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(1200);

  // 5. 跳转到工单列表并可见新工单
  await expect(page).toHaveURL(/#\/main\/order\/mine/);
  await expect(page.getByText('E2E 测试虚拟机申请').first()).toBeVisible({ timeout: 8000 });

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});

test('用户故事：审核工单并完成开通', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 打开待开通工单（mock 预置的 NAT 工单 state=3）
  await resetPage(page, '/main/order/audit');
  await expect(page.getByText('需处理')).toBeVisible();
  // 找到待开通工单
  await expect(page.getByText('测试服务访问外网').first()).toBeVisible({ timeout: 8000 });
  // 进入详情（点击工单编号链接）
  await page.locator('.el-table__row', { hasText: '测试服务访问外网' }).getByRole('button').first().click();
  await page.waitForTimeout(1000);

  // 2. 详情页显示工单信息与开通配置
  await expect(page.getByText('工单详情')).toBeVisible();
  await expect(page.getByText('测试服务访问外网').first()).toBeVisible();

  // 3. NAT 开通：选择负载均衡集群与分发器
  await page.locator('.choose-box').first().click();
  await page.waitForTimeout(800);
  // step 1: 选择集群（点击行内单选）
  const clusterRow = page.locator('.el-dialog .el-table__row', { hasText: '负载均衡集群A' }).first();
  await clusterRow.locator('.el-radio').click();
  await page.locator('.el-dialog').getByRole('button', { name: '下一步' }).click();
  await page.waitForTimeout(600);
  // step 2: 选择分发器
  const serverRow = page.locator('.el-dialog .el-table__row', { hasText: 'web-server-001' }).first();
  await serverRow.locator('.el-radio').click();
  await page.locator('.el-dialog').getByRole('button', { name: '完成' }).click();
  await page.waitForTimeout(600);
  // 提交开通动作
  await page.getByRole('button', { name: '开通' }).click();
  await page.waitForTimeout(1000);
  // 开通成功 → 状态变为已完成
  await expect(page.getByText('已完成').first()).toBeVisible({ timeout: 8000 });

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});

test('用户故事：审核同意与驳回工单', async ({ page }) => {
  // 1. 待处理工单（state=1）在需处理页
  await resetPage(page, '/main/order/audit');
  await expect(page.getByText('搭建测试环境虚拟机').first()).toBeVisible({ timeout: 8000 });

  // 2. 同意第一个待处理工单
  const row = page.locator('.el-table__row', { hasText: '搭建测试环境虚拟机' }).first();
  await row.getByRole('button', { name: '同意' }).click();
  await page.waitForTimeout(800);
  // 弹窗填备注并确认
  await page.locator('.el-dialog textarea').fill('E2E 审核同意');
  await page.getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(1000);
  // 同意后 state 1→2，仍在需处理页但状态变为审核中
  await expect(page.getByText('审核中').first()).toBeVisible({ timeout: 8000 });

  // 3. 驳回另一个工单
  await resetPage(page, '/main/order/audit');
  await expect(page.getByText('审核中').first()).toBeVisible({ timeout: 8000 });
  const row2 = page.locator('.el-table__row', { hasText: '搭建测试环境虚拟机' }).first();
  await row2.getByRole('button', { name: '驳回' }).click();
  await page.waitForTimeout(800);
  await page.locator('.el-dialog textarea').fill('E2E 驳回');
  await page.getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(1000);
  // 驳回后进入已完成 tab（state=11）
  await page.getByText('已完成', { exact: true }).click();
  await page.waitForTimeout(800);
  await expect(page.getByText('已废弃').first()).toBeVisible({ timeout: 8000 });
});

test('用户故事：工单列表丢弃工单', async ({ page }) => {
  await resetPage(page, '/main/order/mine');
  await expect(page.locator('.page-header-left', { hasText: '工单列表' })).toBeVisible();
  // 待处理工单有丢弃按钮
  const row = page.locator('.el-table__row', { hasText: '搭建测试环境虚拟机' }).first();
  await row.getByRole('button', { name: '丢弃' }).click();
  await page.waitForTimeout(800);
  await page.locator('.el-dialog textarea').fill('E2E 丢弃');
  await page.getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(1000);
  // 丢弃后该工单变为已废弃
  await expect(page.getByText('已废弃').first()).toBeVisible({ timeout: 8000 });
});

test('用户故事：已废弃工单重新审核', async ({ page }) => {
  await resetPage(page, '/main/order/mine');
  await expect(page.locator('.page-header-left', { hasText: '工单列表' })).toBeVisible();

  // 自包含：通过 API 创建一个工单并丢弃，得到 state=11 的已废弃工单
  // （mock 不再预置已废弃工单，测试不依赖其他用例的执行顺序）
  const createRes = await page.request.post('http://127.0.0.1:8000/ticket/api/v1/tickets?cmd=CreateTicket', {
    data: { type: 1, resource: { usage: '重新审核流程测试' }, description: '重新审核流程测试', tenant_id: '1001' },
  });
  const created = (await createRes.json()).data;
  await page.request.post(`http://127.0.0.1:8000/ticket/api/v1/ticket/${created.id}?cmd=UpdateStateByAction`, {
    data: { action: 12, description: 'E2E 丢弃后重新审核' },
  });

  // 刷新列表，找到已废弃工单
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const row = page.locator('.el-table__row', { hasText: '重新审核流程测试' }).first();
  await row.getByRole('button', { name: '重新审核' }).click();
  await page.waitForTimeout(800);
  // ElMessageBox 确认
  await page.locator('.el-message-box__btns button', { hasText: '确定' }).click();
  await page.waitForTimeout(1000);
  // 创建新工单成功提示
  await expect(page.getByText('发起重新审核成功！').first()).toBeVisible({ timeout: 8000 });
});
