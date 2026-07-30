<template>
  <div class="gs-transfer">
    <panel
      :title="titleList[0]"
      :data="leftList"
      v-model="leftChecked"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder || gsi18n('gs.transfer.placeholder')"
      :no-data-text="noDataText || gsi18n('gs.transfer.noDataText')"
    />
    <div class="gs-transfer-actions">
      <gs-button
        type="primary"
        :disabled="rightChecked.length === 0"
        @click="handle2Left"
      >
        <slot name="left-button">
          <gs-icon name="left" />
        </slot>
      </gs-button>
      <gs-button
        type="primary"
        :disabled="leftChecked.length === 0"
        @click="handle2Right"
      >
        <slot name="right-button">
          <gs-icon name="right" />
        </slot>
      </gs-button>
      <gs-button
        type="primary"
        :disabled="!hasModify"
        @click="reset"
      >
        <slot name="reset-button">
          <gs-icon name="refresh" />
        </slot>
      </gs-button>
    </div>
    <panel
      :title="titleList[1]"
      :data="rightList"
      v-model="rightChecked"
      :filterable="filterable"
      :filter-placeholder="filterPlaceholder || gsi18n('gs.transfer.placeholder')"
      :no-data-text="noDataText || gsi18n('gs.transfer.noDataText')"
      :sortable="sortable"
      :text-to-chcked="textToChcked"
      @sort="handleSort"
    />
  </div>
</template>

<script>
import emitter from '@gs-ui/gs-ui/lib/_utils/mixins/emitter';
import locale from '@gs-ui/gs-ui/lib/_utils/mixins/i18n';
import Panel from './panel';

export default {
  name: 'Transfer',
  components: {
    Panel,
  },
  mixins: [emitter, locale],
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    filterable: Boolean,
    filterPlaceholder: {
      type: String,
      default: undefined,
    },
    filterMethod: Function,
    titles: {
      type: Array,
      default() {
        return undefined;
      },
    },
    props: Object,
    renderItem: Function,
    noDataText: {
      type: String,
      default: undefined,
    },
    leftDefaultChecked: {
      type: Array,
      default() {
        return [];
      },
    },
    rightDefaultChecked: {
      type: Array,
      default() {
        return [];
      },
    },
    sortable: Boolean,
    textToChcked: Boolean,
    validateEvent: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      valueCopy: [...this.value],
      targetKeys: this.value,
      leftChecked: this.leftDefaultChecked,
      rightChecked: this.rightDefaultChecked,
    };
  },
  watch: {
    value(val) {
      this.targetKeys = val;
      if (this.validateEvent) {
        this.dispatch('GsFormItem', 'gs.form.change', [this.targetKeys]);
      }
    },
    targetKeys(val) {
      this.$emit('input', val);
    },
  },
  computed: {
    hasModify() {
      return this.targetKeys.some((item, index) => this.valueCopy[index] !== item);
    },
    titleList() {
      const { gsi18n } = this;

      return this.titles || [gsi18n('gs.transfer.leftTitle'), gsi18n('gs.transfer.rightTitle')];
    },
    sources() {
      let list = this.data;

      if (this.props) {
        const { props } = this;
        const label = props.label || 'label';
        const value = props.value || 'value';
        const disabled = props.disabled || 'disabled';

        list = list.map(item => ({
          label: item[label],
          value: item[value],
          disabled: item[disabled],
        }));
      }
      return list;
    },
    leftList() {
      return this.sources.filter(item => this.targetKeys.indexOf(item.value) === -1);
    },
    rightList() {
      const list = [];

      this.targetKeys.forEach(val => {
        this.sources.forEach(item => {
          if (item.value === val) {
            list.push(item);
          }
        });
      });

      return list;
      // return this.sources.filter(item => {
      //   return this.targetKeys.indexOf(item.value) !== -1;
      // });
    },
  },
  methods: {
    handle2Left() {
      this.rightChecked.forEach(val => {
        const index = this.targetKeys.indexOf(val);

        this.targetKeys.splice(index, 1);
      });

      this.$emit('change', this.targetKeys, 'left', this.rightChecked);
      this.rightChecked = [];
      // if (this.validateEvent) {
      //   this.dispatch('GsFormItem', 'gs.form.change', [this.targetKeys]);
      // }
    },
    handle2Right() {
      this.leftChecked.forEach(val => {
        this.targetKeys.push(val);
      });

      this.$emit('change', this.targetKeys, 'right', this.leftChecked);
      this.leftChecked = [];
      // if (this.validateEvent) {
      //   this.dispatch('GsFormItem', 'gs.form.change', [this.targetKeys]);
      // }
    },
    handleReset() {
      this.$emit('reset', this.targetKeys, this.valueCopy);
    },
    reset() {
      this.targetKeys = [...this.valueCopy];
    },
    handleSort(targetKeys) {
      const result = [...this.targetKeys];
      const spaces = targetKeys.map(key => {
        return result.findIndex(item => item === key);
      }).sort((a, b) => a - b);
      targetKeys.forEach((targetKey, index) => {
        result[spaces[index]] = targetKey;
      });
      this.targetKeys = result;
      this.$emit('sort', this.targetKeys);
    },
  },
};
</script>
