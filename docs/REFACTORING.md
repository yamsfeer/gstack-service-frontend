# ServicePlatform 前端 — Vue 3 迁移重构与测试体系建设说明

> 本文档记录本项目从 Vue 2 技术栈（配合 gs-ui 组件库）重构至 **Vue 3 + Vite + Element Plus** 的过程中，
> 本轮完成的工作：测试体系从零搭建、覆盖率达标、以及测试驱动下修复的一批 Vue 2 → Vue 3 迁移遗留缺陷。

---

## 一、背景

- 项目：ServicePlatform 自助服务工单系统（`work-order`）
- 重构基线：`c4bb046`（Vue 3 + Vite + Element Plus + Pinia + Vue Router，含 `gs-*` 组件兼容层）
- 本轮目标：
  1. 依据业务代码反推业务需求，编写**组件测试**与**端到端测试**
  2. 覆盖率 ≥ 90%
  3. 前后端 API 契约（参数 / 返回值 / Schema）**不做大范围改动**
  4. 所有测试报错均在业务代码中解决，不通过修改测试「绕过去」
  5. 生成详尽的测试报告

---

## 二、测试体系

### 技术选型

| 工具 | 用途 |
| --- | --- |
| Vitest 2.1 + happy-dom | 组件 / 单元测试（`vite.config.js` `test` 段） |
| @vitest/coverage-v8 | 覆盖率统计（text / html / json-summary / lcov → `tests/coverage/`） |
| Playwright 1.60 | 端到端测试（`playwright.config.cjs`） |
| Express Mock Server | 按 `src/service/*` 的调用 Schema 实现的 Mock API（`mock/server.cjs`，`POST /__mock/reset` 重置） |

### 测试结果

- **单元测试**：23 个文件、**402 个用例全部通过**（可独立运行，不依赖外部服务）
- **行覆盖率 92.98%**（≥ 90% 目标）、分支覆盖率 87.74%、函数覆盖率 62.46%
- **E2E 测试**：21 个用例全部通过（工单全生命周期 + 资产业务流 + 所有模块页面冒烟）
- 测试报告：`tests/REPORT.md`

---

## 三、测试驱动修复的 Vue 2 → Vue 3 迁移遗留缺陷

这些缺陷在迁移后实际**导致页面不可用或交互失效**，通过编写测试逐一暴露并修复（详见 `tests/REPORT.md` 第五节）：

### 1. 模板语法兼容层

| 缺陷 | 影响 | 修复 |
| --- | --- | --- |
| Vue 2 过滤器 `\| arr2str`（6 个资产页） | Vue 3 中编译为**按位或**，列表列值恒为 0 | 改为方法调用 `arr2str(row[item.value])`；`filters` 选项并入 `methods` |
| Vue 2 `slot="filter/tool/table"`（5 个资产页） | Vue 3 中具名插槽不生效，页面主区域空白 | 改为 `<template #filter/tool/table>` |
| Vue 2 `slot-scope="{ row }"`（6 个资产页） | el-table cell 渲染时 row 为 undefined，表格 0 行 | 改为 `#default="{ row }"` |
| `modelValue` 的 `default: () => []`（radio-button） | 恒生效，遮蔽 Vue 2 `:value` 用法 | default 改 `undefined`，watch 加判空 |

### 2. Element Plus 适配

| 缺陷 | 影响 | 修复 |
| --- | --- | --- |
| `gs-switch` 直接映射 ElSwitch，旧 `on-value/off-value` 无效 | 字符串值被 ElSwitch 视为非法，加载时自动 emit change → **误弹确认框** | 新增 `GsSwitch` 包装，映射 `active-value/inactive-value` |
| `col-config` 未声明 `modelValue` | 父级 `v-model`（数组）透传至 ElDialog → 弹窗常开 | 支持 `modelValue` prop |
| 流程步骤组件用 `value` prop 但父级 `v-model` | 开通环节等子菜单不渲染 | 补 `modelValue` 支持并同步 `update:modelValue` |
| `gs-icon-edit` 字体图标资源缺失 | 图标 0×0 不可点击 | 补充 Unicode 可见内容与尺寸 |

### 3. 逻辑正确性

| 缺陷 | 影响 | 修复 |
| --- | --- | --- |
| `saveColConfig` 的 `$refs...doLayout()` 无防御（7 处） | el-table 未渲染时抛错 | 改可选链 `?.doLayout?.()` |
| `addPort` 端口为空时 `parseInt(null)=NaN` | NaN 混入端口列表 | 先判空再校验 |
| `(res.data.statistics \|\| [].map(...))` 运算符优先级 | 子网列表未映射 | 改为 `(…\|\| []).map(...)` |
| `applyForm/dns.vue` 的 `form.domain` 索引赋值 | ElCascader 多次更新 modelValue 时存在竞态，域名校验失败 | 改为整体赋值 |

### 4. Mock Server 与 Schema 对齐

| 缺陷 | 影响 | 修复 |
| --- | --- | --- |
| `ticketSeq` 在 reset 后重置为 10000 | 新工单 id 与初始工单冲突 | 不再重置 |
| ip searchers 返回 `types`，前端读 `ip_types` | IP 类型下拉为空 | 对齐为 `ip_types` |
| `ips/batch` 期望数组，前端发单对象 | 添加 IP 返回 500 | 兼容单对象与数组 |

### 5. 侧边导航（本轮最后修复）

| 缺陷 | 影响 | 修复 |
| --- | --- | --- |
| `'/' + item.path` 拼接出 `//main/...`（双斜杠） | `router.push` 匹配不到路由，**菜单点击无反应、不跳转、无报错** | `index` 直接使用 `item.path` |
| SideNav 仅支持一级子菜单 | 二级菜单「资产 > 负载均衡 > 集群/LVS/NAT」的子项在菜单中丢失 | 新增递归组件 `nav-item.vue` |
| `iconMap` 放 `data()` 返回被 reactive | 触发 "Component that was made reactive" 警告 | 用 `markRaw` 标记 |

---

## 四、新增 / 修改的核心文件

### 测试源码（提交入库）

- `tests/unit/`（23 个文件）：`views-order`、`views-assets*`、`views-apply`、`views-manage`、`views-detail-*`、`detail-layout`、`services`、`stores`、`components`、`mixins`、`validator`、`ipValidate`、`http` 等
- `tests/e2e/`（3 个 spec）：
  - `smoke.spec.cjs` — 全部模块页面冒烟
  - `order-flow.spec.cjs` — 工单全生命周期（提交 / 审核 / 开通 / 驳回 / 丢弃 / 重新审核）
  - `assets-flow.spec.cjs` — 资产业务流（IP 添加 / DNS 编辑 / 服务器录入 / DNS 工单 / 流程创建）
- `tests/helpers.js`、`tests/setup.js`、`playwright.config.cjs`

### 业务代码修复（提交入库）

- 组件：`radio-button.vue`、`col-config.vue`、`side-nav.vue`、`nav-item.vue`（新增）、`global.scss`
- 兼容层：`stores/gs-ui-compat.js`（新增 `GsSwitch` 等）
- 视图：6 个资产页（模板语法）、`detailLayout.vue`、`applyForm/dns.vue`、流程步骤组件、`detail/lvs/index.vue`
- Mock：`mock/server.cjs`

---

## 五、如何运行

```bash
# 单元测试（无需 mock server，独立运行）
pnpm test:unit            # vitest run

# 覆盖率
vitest run --coverage     # 输出到 tests/coverage/

# 端到端测试（自动拉起 Mock API + Vite）
pnpm test:e2e             # playwright test
```

---

## 六、遗留与建议

1. **函数覆盖率 62%**：视图层方法（弹窗 / 错误分支）可继续补充用例。
2. `formRules.js`、`index.js`（组件注册）等纯声明文件可酌情纳入测试。
3. 测试报告以手写 `tests/REPORT.md` 为准；`tests/coverage/`、`tests/e2e-report/` 为自动生成产物，已加入 `.gitignore`，可随时重新生成。
