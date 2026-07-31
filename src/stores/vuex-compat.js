// Pinia compatibility layer — emulates vuex mapState/mapActions/mapGetters/mapMutations
import { mapState as piniaMapState, mapActions as piniaMapActions } from 'pinia';
import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/user';
import { useManageStore } from '@/stores/manage';
import { useAssetStore } from '@/stores/asset';
import { useLoginInfoStore } from '@/stores/loginInfo';
import { useStoreParamsStore } from '@/stores/storeParams';

const storeMap = {
  order: useOrderStore,
  user: useUserStore,
  manage: useManageStore,
  asset: useAssetStore,
};

export function mapState(namespace, map) {
  if (typeof namespace === 'object') {
    return piniaMapState(useLoginInfoStore, namespace);
  }
  const useStore = storeMap[namespace];
  if (!useStore) return {};
  return piniaMapState(useStore, map);
}

export function mapActions(namespace, actions) {
  const useStore = storeMap[namespace];
  if (!useStore) return {};
  if (Array.isArray(actions)) {
    const mapped = {};
    actions.forEach(action => {
      mapped[action] = function (...args) {
        const store = useStore();
        return store[action](...args);
      };
    });
    return mapped;
  }
  return piniaMapActions(useStore, actions);
}

export function mapGetters(map) {
  // mapGetters in old code uses GET_USER_INFO, GET_TOKEN, GET_TENANT from loginInfo
  // and GET_STORE_PARAMS from storeParams. Since most getters are in loginInfo,
  // we map them all to loginInfo, but try storeParams for GET_STORE_PARAMS.
  const result = {};
  Object.keys(map).forEach(key => {
    const getterName = map[key];
    if (getterName === 'GET_STORE_PARAMS') {
      result[key] = piniaMapState(useStoreParamsStore, { [key]: getterName })[key];
    } else {
      result[key] = piniaMapState(useLoginInfoStore, { [key]: getterName })[key];
    }
  });
  return result;
}

// mapMutations — for storeParams, loginInfo etc.
export function mapMutations(mutations) {
  if (typeof mutations === 'object' && !Array.isArray(mutations)) {
    const mapped = {};
    Object.keys(mutations).forEach(key => {
      mapped[key] = function (...args) {
        const store = useStoreParamsStore();
        const fnName = mutations[key] || key;
        if (typeof store[fnName] === 'function') store[fnName](...args);
      };
    });
    return mapped;
  }
  if (Array.isArray(mutations)) {
    const mapped = {};
    mutations.forEach(mutation => {
      mapped[mutation] = function (...args) {
        const store = useStoreParamsStore();
        if (typeof store[mutation] === 'function') {
          store[mutation](...args);
        } else {
          // Try loginInfo store
          const loginStore = useLoginInfoStore();
          if (typeof loginStore[mutation] === 'function') {
            loginStore[mutation](...args);
          }
        }
      };
    });
    return mapped;
  }
  return {};
}

// Status helpers
export const LOADING = 'LOADING';
export const SUCCESS = 'SUCCESS';
export const FAIL = 'FAIL';

export function checkLoading(status) {
  return LOADING === status;
}

export function checkSuccess(status) {
  return SUCCESS === status;
}
