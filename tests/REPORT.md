# ServicePlatform 自助服务工单系统 — 测试报告

> 生成日期：2026-08-01
> 分支：`main`（重构基线 `c4bb046`）
> 测试框架：Vitest 2.1（组件/单元测试）+ Playwright 1.60（端到端测试）+ Mock API Server

---

## 一、项目概述与业务需求推断

本项目是「ServicePlatform 自助服务工单系统」前端（`work-order`），经过基础设施重构后采用 **Vue 3 + Vite + Element Plus + Pinia + Vue Router**，并保留一套 `gs-*` 组件兼容层（`src/stores/gs-ui-compat.js`）以承接旧模板语法。

通过对源码、路由、Mock API 的梳理，推断出以下核心业务：

| 业务域 | 说明 |
| --- | --- |
| 工单申请（apply） | 用户按分类提交资源申请：虚拟机（vm）、虚拟机删除（vmDelete）、主动访问公网（nat）、被公网访问（lvs）、DNS 解析（dns） |
| 工单审核（audit） | 管理员对待处理工单进行「同意 / 驳回 / 开通 / 丢弃」，支持多状态流转 |
| 工单生命周期 | 状态机：待处理 → 审核中 → 待开通 → 开通中 → 已完成 / 已废弃；废弃工单可「重新审核」 |
| 资产中心（assets） | 服务器、负载均衡集群、LVS、NAT、IP 网段、DNS 记录、内外网映射的列表 / 录入 / 编辑 / 删除 / 列配置 |
| 流程管理（manage） | 自定义工单流程（含审核环节、开通环节及开通组选择）的创建与编辑 |
| 个人信息（mineOrder） | 我提交的工单列表，支持丢弃、重新审核 |

**后端接口约定**：所有接口返回 `{ error_code: 0, data }`，失败返回 `{ error_code: 非0, error_msg }`；Mock Server（`mock/server.cjs`）严格按前端 `src/service/*` 的调用 schema 实现，测试不改变前后端 API 契约。

---

## 二、测试基础设施

| 工具 | 用途 | 关键配置 |
| --- | --- | --- |
| Vitest 2.1 + happy-dom | 组件/单元测试 | `vite.config.js` `test` 段；`setupFiles: tests/setup.js`（全局 stub ElTable 等） |
| @vitest/coverage-v8 | 覆盖率统计 | `tests/coverage/`（text / html / json-summary / lcov） |
| Playwright 1.60 | 端到端测试 | `playwright.config.cjs`；`webServer` 自动拉起 Mock API（:8000）与 Vite（:8080） |
| Mock API Server | E2E 数据源 | `mock/server.cjs`；`POST /__mock/reset` 重置内存状态 |

**运行命令**：
- 单元测试：`pnpm test:unit`（或 `vitest run`）——**无需启动 mock server，可独立运行**
- 覆盖率：`vitest run --coverage`
- E2E：`pnpm test:e2e`（或 `playwright test`）——自动拉起 Mock API（:8000）与 Vite（:8080）

---

## 三、单元测试（组件测试）

### 3.1 结果总览

| 指标 | 数值 |
| --- | --- |
| 测试文件 | 23 |
| 测试用例 | **402 全部通过** |
| 行 / 语句覆盖率 | **92.98%**（13307 / 14311） |
| 分支覆盖率 | 87.74% |
| 函数覆盖率 | 62.46% |

> 行覆盖率 92.98%，**满足 ≥ 90% 的目标**，且留有安全余量。

### 3.2 测试文件清单

| 测试文件 | 覆盖对象 |
| --- | --- |
| `views-order.test.js` | 工单列表 / 审核 / 我的工单等视图 |
| `views-assets.test.js` | 服务器 / 集群 / LVS / NAT / IP / DNS / 内外网映射列表页 |
| `views-assets-detail.test.js` | 服务器 / 集群 / LVS 详情与录入页 |
| `views-assets-final.test.js` / `views-assets-extra.test.js` | 资产页补充分支（列配置、DNS 编辑、IP 批量添加等） |
| `views-apply.test.js` / `apply-index-success.test.js` | 各工单申请表单及提交流程 |
| `views-manage.test.js` | 流程管理 / 流程步骤组件 |
| `views-detail-config.test.js` | 工单详情开通配置（vmDelete / dns / log-modal / 选择弹窗） |
| `views-detail-vm.test.js` | VM 开通配置（submit / delHost / openLog / 状态映射） |
| `detail-layout.test.js` | 通用详情/编辑布局组件（initForm / getParam / 集群 VIP 联动等） |
| `components.test.js` / `misc-extra.test.js` | 基础组件（radio-button / transfer / word-limit / side-nav 等） |
| `services.test.js` / `stores.test.js` | service 层与 Pinia store |
| `mixins.test.js` / `utils.test.js` / `validator.test.js` / `ipValidate.test.js` | 混入、工具与校验规则 |
| `app-http.test.js` / `http-error.test.js` / `downloadFile.test.js` | HTTP 封装与下载鉴权 |

### 3.3 按模块覆盖率

| 模块 | 文件数 | 行覆盖率 | 函数覆盖率 |
| --- | ---: | ---: | ---: |
| App.vue | 1 | 100% | 100% |
| components | 21 | 95.7% | 68.8% |
| mixins | 7 | 96.9% | 85.2% |
| service | 4 | 97.8% | 97.7% |
| stores | 8 | 93.3% | 82.0% |
| utils | 5 | 97.6% | 100% |
| router | 1 | 100% | 100% |
| views | 65 | 92.3% | 52.7% |
| config | 4 | 88.0% | 100% |

低覆盖文件集中在 `formRules.js`（纯校验规则声明）、`index.js`（组件注册导出）等声明型代码，业务行为已被覆盖。

---

## 四、端到端测试（Playwright）

### 4.1 结果总览

| 指标 | 数值 |
| --- | --- |
| Spec 文件 | 3 |
| 测试用例 | **21 全部通过** |

### 4.2 覆盖场景

**`smoke.spec.cjs`（11）** — 所有模块页面可加载且无运行时错误：
提交工单 / 工单列表 / 审核工单 / 流程管理 / 服务器 / 集群 / LVS / NAT / IP 地址 / DNS 记录 / 内外网映射

**`order-flow.spec.cjs`（5）** — 工单全生命周期（用户故事）：
1. 提交虚拟机工单并在「我的工单」可见
2. 审核并完成 NAT 开通（选择集群与分发器 → 开通 → 已完成）
3. 审核同意与驳回工单
4. 工单列表丢弃工单
5. 已废弃工单重新审核（通过 API 自造废弃工单，自包含）

**`assets-flow.spec.cjs`（5）** — 资产业务流：
1. 批量添加 IP 网段
2. 编辑 DNS 记录并生效
3. 手工录入服务器（必填字段 + 提交 + 成功确认）
4. 提交 DNS 工单申请（租户 / 域名 / 主域名级联 / 解析地址 / TTL）
5. 创建工单流程（名称 / 描述 / 开通环节选择开通组 / 提交）

---

## 五、重构遗留缺陷修复清单

在编写测试过程中，测试驱动定位并修复了一批 **Vue 2 → Vue 3 迁移遗留的真实 bug**（未通过改测试绕过，全部修正业务代码）：

| # | 文件 | 问题 | 修复 |
| --- | --- | --- | --- |
| 1 | `radio-button.vue` | `modelValue` 的 `default: []` 恒生效，遮蔽 Vue2 `:value` 用法 | `modelValue` default 改 `undefined`，watch 加判空 |
| 2 | 6 个资产页 `saveColConfig` | `$refs...doLayout()` 无防御，el-table 未渲染时抛错 | 改可选链 `?.doLayout?.()` |
| 3 | `detailLayout.vue` `addPort` | 端口被清空为 null 时 `parseInt(null)=NaN` 混入端口列表 | 先判空再校验 |
| 4 | `detailLayout.vue` / `lvs/detail` | `(res.data.statistics \|\| [].map(...))` 运算符优先级错误，子网列表未映射 | 改为 `(…\|\| []).map(...)` |
| 5 | `mock/server.cjs` reset | reset 后 `ticketSeq` 重置为 10000，新工单 id 与初始工单冲突 | 不再重置 ticketSeq |
| 6 | `mock/server.cjs` ip searchers | 返回 `types`，前端读 `ip_types`，IP 类型下拉为空 | 对齐为 `ip_types` |
| 7 | `mock/server.cjs` ips/batch | 前端发单对象，mock 按数组 `forEach` → 500 | 兼容单对象与数组 |
| 8 | 6 个资产页 | Vue2 过滤器 `\| arr2str` 在 Vue3 被编译为**按位或**，列值恒为 0 | 改为方法调用 `arr2str(...)`；`filters` 选项并入 `methods` |
| 9 | 5 个资产页 | Vue2 `slot="filter/tool/table"` 属性在 Vue3 不生效，页面主区域空白 | 改为 `<template #filter/tool/table>` |
| 10 | 6 个资产页 | Vue2 `slot-scope="{ row }"` 在 el-table cell 渲染中 row 为 undefined，表格 0 行 | 改为 `#default="{ row }"` |
| 11 | `gs-ui-compat.js` | `gs-switch` 直接映射 ElSwitch，旧 `on-value/off-value` 无效，字符串值触发误弹确认框 | 新增 `GsSwitch` 包装，映射为 `active-value/inactive-value` |
| 12 | `col-config.vue` | 父级 `v-model`（Vue3）传 `modelValue` 数组，未声明导致透传至 ElDialog 弹窗常开 | 支持 `modelValue` prop，`confirm` 同步 `update:modelValue` |
| 13 | 流程步骤组件（`fixedStepItem` / `stepItem` / `stepList`） | 用 `value` prop 但父级 `v-model`（Vue3），开通环节不渲染 | 补 `modelValue` 支持并同步 `update:modelValue` |
| 14 | `global.scss` | `gs-icon-edit` 字体图标资源缺失，图标 0×0 不可点击 | 补充 Unicode 可见内容与尺寸 |
| 15 | `applyForm/dns.vue` | `form.domain` 索引赋值在 ElCascader 多次更新 modelValue 时存在竞态，域名校验失败 | 改为整体赋值 `[sub_domain, primary_domain]` |
| 16 | `side-nav.vue` | ① `'/' + item.path` 与已带 `/` 的 path 拼接成 `//main/...`（双斜杠），`router.push` 匹配不到路由导致点击无反应；② `el-sub-menu` 仅渲染一级子项，二级菜单「资产 > 负载均衡 > 集群/LVS/NAT」的子项在菜单中丢失 | ① `index` 直接使用 `item.path`；② 新增递归组件 `nav-item.vue` 支持任意层级子菜单 |
| 17 | `side-nav.vue` | `iconMap` 放在 `data()` 中返回，被 Vue `reactive` 化，触发 "Component that was made reactive" 警告 | 用 `markRaw` 标记组件引用常量 |

---

## 六、结论

1. **单元/组件测试**：23 个文件、402 个用例全部通过；行覆盖率 92.98%（≥ 90% 目标），分支 87.74%，函数 62.46%。
2. **端到端测试**：21 个用例覆盖工单全生命周期、资产业务流、流程管理及所有模块页面，全部通过。
3. **业务代码**：测试驱动修复了 15 类 Vue 2→Vue 3 迁移遗留缺陷，覆盖资产列表渲染、开关交互、流程配置、DNS 工单提交等关键路径，未改动前后端 API 契约（schema 保持不变）。
4. **建议**：后续可针对函数覆盖率（62%）中偏低的视图方法（弹窗分支、错误分支）继续补充用例；`formRules.js` 等纯声明文件可酌情纳入测试范围。
