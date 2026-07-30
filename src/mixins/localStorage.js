import { save2Local, getLocal } from '@/utils/utils';

export default {
  methods: {
    getLocal(key = '') {
      return getLocal(key);
    },
    saveToLocal(key = '', value = []) {
      save2Local(key, value);
    },
  },
};
