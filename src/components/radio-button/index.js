import radioButton from './radio-button.vue';
import './style.scss';

/* istanbul ignore next */
radioButton.install = function (Vue) {
  Vue.component(radioButton.name, radioButton);
};

export default radioButton;
