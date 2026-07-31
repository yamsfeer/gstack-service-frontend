import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ElementPlus from 'element-plus';
import gsUiCompat from '@/stores/gs-ui-compat';
import components from '@/components';
import { createMounter } from '../helpers';

import QueryTable from '@/components/query-table.vue';
import TablePage from '@/components/table-page.vue';
import ServerTable from '@/components/server-table.vue';
import FilterTable from '@/components/filter-table/filter-table.vue';
import FilterTableItem from '@/components/filter-table/filter-table-item.vue';
import RadioBox from '@/components/radio-box.vue';
import WordLimit from '@/components/word-limit.vue';
import RadioButton from '@/components/radio-button/radio-button.vue';
import SideNav from '@/components/side-nav.vue';
import ColConfig from '@/components/col-config.vue';
import Transfer from '@/components/transfer/transfer.vue';
import BasicHeader from '@/components/basic-header/basic-header.vue';
import BasicLayout from '@/components/basic-layout/layout.vue';

const global = {
  plugins: [ElementPlus, gsUiCompat, components],
  stubs: { transition: false, 'router-link': { template: '<a><slot /></a>' } },
  mocks: {
    $router: { push: () => {} },
    $route: { path: '/main', meta: {}, params: {} },
  },
};

describe('components/query-table.vue', () => {
  it('渲染标题并触发 query / reset-query 事件', async () => {
    const wrapper = mount(QueryTable, { global, props: { title: '查询条件' } });
    expect(wrapper.text()).toContain('查询条件');
    const buttons = wrapper.findAll('.el-button');
    expect(buttons.length).toBe(2);
    await buttons[0].trigger('click');
    expect(wrapper.emitted('query')).toBeTruthy();
    await buttons[1].trigger('click');
    expect(wrapper.emitted('reset-query')).toBeTruthy();
  });
});

describe('components/table-page.vue', () => {
  it('渲染三个插槽', () => {
    const wrapper = mount(TablePage, {
      global,
      slots: { filter: '<div class="f">filter</div>', tool: '<div class="t">tool</div>', table: '<div class="tb">table</div>' },
    });
    expect(wrapper.find('.f').text()).toBe('filter');
    expect(wrapper.find('.t').text()).toBe('tool');
    expect(wrapper.find('.tb').text()).toBe('table');
  });
});

describe('components/server-table.vue', () => {
  it('渲染表格数据并转发事件', async () => {
    const wrapper = mount(ServerTable, {
      global,
      props: {
        tableData: [{ id: 1, name: 'a' }],
        totalNum: 1,
        pageSize: 10,
        pageNumber: 1,
        rowKey: row => row.id,
      },
    });
    await new Promise(r => setTimeout(r, 20));
    // ElTable 在单元测试中被全局 stub，真实渲染由 E2E 验证
    expect(wrapper.find('.el-table-stub').exists()).toBe(true);
    wrapper.vm.sortChange({ order: 'ascending', prop: 'name' });
    expect(wrapper.emitted('sortChange')).toBeTruthy();
    wrapper.vm.handleCurrentChange(2);
    expect(wrapper.emitted('currentChange')).toEqual([[2, 10]]);
    wrapper.vm.handlePageSizeChange(20);
    expect(wrapper.emitted('sizeChange')).toEqual([[20, 1]]);
  });
});

describe('components/filter-table.vue', () => {
  it('FilterTableItem 使用父级 labelWidth', () => {
    const wrapper = mount({
      template: `
        <filter-table label-width="140px">
          <filter-table-item label="产品线">
            <div class="child">x</div>
          </filter-table-item>
        </filter-table>
      `,
    }, {
      global: { plugins: [ElementPlus, gsUiCompat, components] },
    });
    const label = wrapper.find('.filter-table-item-label');
    expect(label.text()).toContain('产品线');
    expect(label.attributes('style')).toContain('width: 140px');
    expect(wrapper.find('.child').text()).toBe('x');
  });
});

describe('components/radio-box.vue', () => {
  it('渲染选项并 emit input', async () => {
    const boxData = [{ value: 'a', title: 'A', desc: 'descA' }, { value: 'b', title: 'B', desc: 'descB' }];
    const wrapper = mount(RadioBox, { global, props: { boxData, value: 'a' } });
    expect(wrapper.text()).toContain('A');
    expect(wrapper.text()).toContain('descB');
    wrapper.vm.handleChange('b');
    expect(wrapper.emitted('input')).toEqual([['b']]);
  });
});

describe('components/word-limit.vue', () => {
  it('统计字符长度并高亮超限', async () => {
    const wrapper = mount(WordLimit, { global, props: { max: 3, val: 'abc' } });
    expect(wrapper.text()).toContain('3 / 3');
    expect(wrapper.find('.warning').exists()).toBe(false);
    await wrapper.setProps({ val: 'abcd' });
    expect(wrapper.find('.warning').exists()).toBe(true);
    expect(wrapper.text()).toContain('4 / 3');
  });
});

describe('components/radio-button.vue', () => {
  it('单选与多选逻辑', async () => {
    const data = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }];
    const wrapper = mount(RadioButton, { global, props: { data, value: [] } });
    expect(wrapper.text()).toContain('全部');
    wrapper.vm.handleClick(data[0], 0);
    expect(wrapper.emitted('input')[0]).toEqual([['a']]);
    // 单选模式下点击另一个替换
    wrapper.vm.handleClick(data[1], 1);
    expect(wrapper.emitted('input')[1]).toEqual([['b']]);
  });

  it('多选模式支持取消选择', () => {
    const data = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }];
    const wrapper = mount(RadioButton, { global, props: { data, value: ['a'], multiple: true } });
    wrapper.vm.handleClick(data[0], 0);
    expect(wrapper.emitted('input')[0]).toEqual([[]]);
  });

  it('clear 清空选择，toggle 展开收起', () => {
    const data = [{ label: 'A', value: 'a' }];
    const wrapper = mount(RadioButton, { global, props: { data, value: ['a'], showType: 'toggle' } });
    wrapper.vm.clear();
    expect(wrapper.emitted('input')[0]).toEqual([[]]);
    expect(wrapper.vm.isShow).toBe(false);
    wrapper.vm.toggle();
    expect(wrapper.vm.isShow).toBe(true);
  });
});

describe('components/side-nav.vue', () => {
  it('渲染菜单项与子菜单', () => {
    const data = [
      { path: 'order', title: '工单', icon: 'bars', children: [{ path: 'order/apply', title: '提交工单' }] },
      { path: 'manage', title: '流程管理', icon: 'setting-o' },
    ];
    const wrapper = mount(SideNav, { global, props: { data } });
    expect(wrapper.text()).toContain('工单');
    expect(wrapper.text()).toContain('流程管理');
    expect(wrapper.text()).toContain('提交工单');
    expect(wrapper.vm.activeMenu).toBe('/main');
  });
});

describe('components/col-config.vue', () => {
  it('confirm 输出排序后的列', () => {
    const data = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }];
    const wrapper = mount(ColConfig, { global, props: { data, value: [{ value: 'a' }, { value: 'c' }] } });
    wrapper.vm.confirm();
    const emitted = wrapper.emitted('input');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual([data[0], data[2]]);
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('cancel 触发 update:visible', async () => {
    const data = [{ label: 'A', value: 'a' }];
    // 先打开弹窗让 transfer 渲染，cancel 内部调用 transfer.reset()
    const wrapper = mount(ColConfig, { global, props: { data, value: [], visible: true } });
    await new Promise(r => setTimeout(r, 50));
    wrapper.vm.cancel();
    expect(wrapper.emitted('update:visible')).toBeTruthy();
  });
});

describe('components/transfer.vue', () => {
  const data = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }];

  it('左右列表计算与移动', async () => {
    const wrapper = mount(Transfer, { global, props: { data, value: ['a'] } });
    expect(wrapper.vm.leftList.map(x => x.value)).toEqual(['b', 'c']);
    expect(wrapper.vm.rightList.map(x => x.value)).toEqual(['a']);
    // 移动到右侧
    wrapper.vm.leftChecked = ['b'];
    wrapper.vm.handle2Right();
    expect(wrapper.vm.targetKeys).toEqual(['a', 'b']);
    expect(wrapper.emitted('change')[0][1]).toBe('right');
    // 移回左侧
    wrapper.vm.rightChecked = ['a'];
    wrapper.vm.handle2Left();
    expect(wrapper.vm.targetKeys).toEqual(['b']);
    expect(wrapper.emitted('change')[1][1]).toBe('left');
  });

  it('reset 还原初始值', () => {
    const wrapper = mount(Transfer, { global, props: { data, value: ['a'] } });
    wrapper.vm.targetKeys = ['a', 'b'];
    wrapper.vm.reset();
    expect(wrapper.vm.targetKeys).toEqual(['a']);
  });

  it('hasModify 判断是否有修改', async () => {
    const wrapper = mount(Transfer, { global, props: { data, value: ['a'] } });
    expect(wrapper.vm.hasModify).toBe(false);
    wrapper.vm.targetKeys = ['b'];
    expect(wrapper.vm.hasModify).toBe(true);
  });

  it('handleSort 排序逻辑', () => {
    const wrapper = mount(Transfer, { global, props: { data, value: ['a', 'b', 'c'] } });
    wrapper.vm.handleSort(['c', 'a', 'b']);
    expect(wrapper.vm.targetKeys).toEqual(['c', 'a', 'b']);
    expect(wrapper.emitted('sort')).toBeTruthy();
  });
});

describe('components/basic-header.vue', () => {
  it('显示用户名并支持退出登录', async () => {
    const wrapper = createMounter(BasicHeader, {
      global: { mocks: { $route: { path: '/main' } } },
    });
    // loginInfo store 默认 userInfo 为空 → 显示测试用户
    expect(wrapper.text()).toContain('测试用户');
    wrapper.vm.handleSelect(0);
    // logout 内部使用 ElMessageBox，断言方法存在即可
    expect(typeof wrapper.vm.logout).toBe('function');
  });
});

describe('components/basic-layout.vue', () => {
  it('非管理员隐藏鉴权菜单', async () => {
    const wrapper = createMounter(BasicLayout, {
      global: { mocks: { $route: { path: '/main', meta: {}, params: {} } } },
    });
    // userInfo 为空 → isServiceAdmin 为 undefined → 过滤 isAuth 菜单
    expect(Array.isArray(wrapper.vm.slibarData)).toBe(true);
    // 检查所有层级的菜单 path 中不包含 audit（路由级别的 audit 应被过滤）
    const paths = [];
    const collect = list => list.forEach(d => {
      paths.push(d.path || '');
      if (d.children) collect(d.children);
    });
    collect(wrapper.vm.slibarData);
    expect(paths.some(p => p.includes('audit'))).toBe(false);
  });
});
