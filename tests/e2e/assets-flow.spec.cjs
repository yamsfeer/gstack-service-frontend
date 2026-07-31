// ============================================================
// E2E：资产模块业务流（用户故事）
// 批量添加 IP → 编辑 DNS 记录 → 创建工单流程
// 每个用例自包含：beforeEach 重置 mock 状态
// ============================================================
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.request.post('http://127.0.0.1:8000/__mock/reset');
});

async function resetPage(page, path) {
  await page.goto(`/#${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
}

async function selectDialogOption(page, selectIndex, label) {
  await page.locator('.el-dialog .el-select').nth(selectIndex).click();
  await page.waitForTimeout(300);
  await page.locator('.el-select-dropdown__item', { hasText: label }).first().click();
  await page.waitForTimeout(300);
}

test('资产：批量添加 IP 网段', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 打开 IP 列表（资产页无 page-header，用表格行确认加载）
  await resetPage(page, '/main/assets/ip');
  await expect(page.locator('.el-table__row').first()).toBeVisible();

  // 2. 点击添加，弹出创建 IP 弹窗
  await page.getByRole('button', { name: '添加' }).click();
  await page.waitForTimeout(800);
  await expect(page.locator('.el-dialog').getByText('添加IP')).toBeVisible();

  // 3. 选择机房与 IP 类型
  await selectDialogOption(page, 0, '机房A');
  await selectDialogOption(page, 1, '公网IP');

  // 4. 填写 IP 网段（192.168.5.1 - 192.168.5.5 / 24）
  await page.getByPlaceholder('网段中的第一个IP 如192.168.1.1', { exact: true }).fill('192.168.5.1');
  await page.getByPlaceholder('网段中的最后一个IP 如192.168.1.254', { exact: true }).fill('192.168.5.5');
  await page.getByPlaceholder('范围是16至32的整数', { exact: true }).fill('24');
  await page.getByPlaceholder('如192.168.1.1', { exact: true }).fill('192.168.5.1');
  await page.waitForTimeout(300);

  // 5. 提交并断言成功
  await page.locator('.el-dialog').getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(1200);
  await expect(page.getByText('添加IP成功').first()).toBeVisible({ timeout: 8000 });

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});

test('资产：编辑 DNS 记录并生效', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 打开 DNS 列表
  await resetPage(page, '/main/assets/dns');
  await expect(page.locator('.el-table__row').first()).toBeVisible();

  // 2. 找到 www.example.com 并点击编辑
  const row = page.locator('.el-table__row', { hasText: 'www.example.com' }).first();
  await row.getByRole('button', { name: '编辑' }).click();
  await page.waitForTimeout(800);
  await expect(page.locator('.el-dialog').getByText('编辑DNS')).toBeVisible();

  // 3. 修改解析地址与 TTL
  const dialog = page.locator('.el-dialog');
  const inputs = dialog.locator('input[type="text"]');
  await inputs.nth(2).fill('10.20.1.99'); // 解析地址
  await inputs.nth(1).fill('7200');       // TTL
  await page.waitForTimeout(300);

  // 4. 确认提交，断言更新成功
  await dialog.getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(1200);
  await expect(page.getByText('更新成功').first()).toBeVisible({ timeout: 8000 });

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});

test('资产：手工录入服务器', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 打开服务器录入页（非详情模式自动进入编辑表单）
  await resetPage(page, '/main/assets/server/add');
  await expect(page.getByText('添加服务器').first()).toBeVisible();

  // 2. 填写必填字段（所属人/产品线/机房/uuid/主机名/描述）
  await page.locator('.el-form-item').filter({ hasText: '所属人' }).locator('input').fill('admin');
  await page.locator('.el-form-item').filter({ hasText: '产品线' }).locator('.el-select').click();
  await page.waitForTimeout(300);
  await page.locator('.el-select-dropdown__item', { hasText: '产品线A' }).first().click();
  await page.waitForTimeout(200);
  await page.locator('.el-form-item').filter({ hasText: '所在机房' }).locator('.el-select').click();
  await page.waitForTimeout(300);
  await page.locator('.el-select-dropdown__item', { hasText: '机房A' }).first().click();
  await page.waitForTimeout(200);
  await page.locator('.el-form-item').filter({ hasText: 'uuid' }).locator('input').fill('uuid-e2e-001');
  await page.locator('.el-form-item').filter({ hasText: '主机名' }).locator('input').fill('e2e-server-001');
  await page.locator('.el-form-item').filter({ hasText: '服务器描述' }).locator('textarea').fill('E2E 手工录入测试服务器');

  // 3. 点击添加
  await page.getByRole('button', { name: '添加' }).click();
  await page.waitForTimeout(1200);

  // 4. 录入成功弹窗确认后跳转列表
  await expect(page.getByText('录入服务器成功！').first()).toBeVisible({ timeout: 8000 });
  await page.locator('.el-message-box__btns button', { hasText: '确定' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/#\/main\/assets\/server/);

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});

test('提交 DNS 工单申请', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 进入工单分类页，选择 DNS
  await resetPage(page, '/main/order/apply');
  await page.getByRole('link', { name: '提交工单' }).nth(3).click(); // vm/lvs/nat/dns/vmDelete
  await page.waitForTimeout(1200);
  await expect(page.locator('.page-header', { hasText: '创建工单' })).toBeVisible();

  // 2. 选择所属租户
  await page.locator('.el-form-item').filter({ hasText: '所属租户' }).locator('.el-select').click();
  await page.waitForTimeout(300);
  await page.locator('.el-select-dropdown__item', { hasText: '平台研发部' }).first().click();
  await page.waitForTimeout(300);

  // 3. 填写域名（子域 + 主域）
  await page.getByPlaceholder('文本长度不超过63个字符').fill('e2edns');
  await page.locator('.el-cascader').click();
  await page.waitForTimeout(500);
  await page.locator('.el-cascader-node', { hasText: '公网' }).first().click();
  await page.waitForTimeout(500);
  await page.locator('.el-cascader-node', { hasText: 'example.com' }).first().click();
  await page.waitForTimeout(300);

  // 4. 添加解析地址
  const ipInput = page.getByPlaceholder('ip地址，如xx.xx.xx.xx');
  await ipInput.fill('10.20.1.88');
  await ipInput.press('Enter');
  await page.waitForTimeout(300);

  // 5. 填写 TTL 与申请理由
  await page.locator('.el-form-item').filter({ hasText: '记录缓存时间' }).locator('input').fill('3600');
  await page.locator('.el-form-item').filter({ hasText: '申请理由' }).locator('textarea').fill('E2E DNS 工单申请');

  // 6. 提交
  await page.getByRole('button', { name: '提交' }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByText('创建工单成功！').first()).toBeVisible({ timeout: 8000 });
  await page.locator('.el-message-box__btns button', { hasText: '确定' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/#\/main\/order\/mine/);

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});

test('流程管理：创建工单流程', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  // 1. 打开流程管理
  await resetPage(page, '/main/manage');
  await expect(page.locator('.page-header', { hasText: '流程管理' })).toBeVisible();

  // 2. 创建流程
  await page.getByRole('button', { name: '创建工单流程' }).click();
  await page.waitForTimeout(1000);
  await expect(page.locator('.page-header', { hasText: '工单流程' })).toBeVisible();

  // 3. 填写名称与描述
  await page.locator('.el-form-item').filter({ hasText: '流程名称' }).locator('input').fill('E2E 测试流程');
  await page.locator('.el-form-item').filter({ hasText: '描述' }).locator('textarea').fill('端到端测试创建流程');

  // 4. 开通环节必须选择开通组（表单校验要求）
  const openStepItem = page.locator('.step-item').filter({ hasText: '开通环节' });
  await openStepItem.locator('.gs-icon-edit').click();
  await page.waitForTimeout(600);
  const stepModal = page.locator('.el-dialog').filter({ hasText: '编辑环节' });
  await stepModal.locator('.el-select').click();
  await page.waitForTimeout(500);
  await page.locator('.el-select-dropdown__item', { hasText: '运维值班组' }).first().click();
  await page.waitForTimeout(300);
  await stepModal.getByRole('button', { name: '确定' }).click();
  await page.waitForTimeout(600);

  // 5. 提交
  await page.getByRole('button', { name: '提交' }).click();
  await page.waitForTimeout(1200);
  // 5. 成功弹窗确认后跳转回列表
  await expect(page.getByText('创建工单流程成功！').first()).toBeVisible({ timeout: 8000 });
  await page.locator('.el-message-box__btns button', { hasText: '确定' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/#\/main\/manage/);
  await expect(page.getByText('E2E 测试流程').first()).toBeVisible({ timeout: 8000 });

  const realErrors = pageErrors.filter(e => !e.includes('label act as value'));
  expect(realErrors).toEqual([]);
});
