export default {
  data() {
    return {
      autoRefresh: null,
    };
  },
  methods: {
    refresh(fun, timer) {
      setInterval(() => {
        this.refresh();
      }, timer);
    },
  },
  created() {
    this.autoRefresh = setInterval(() => {
      this.refresh();
    }, 10000);
  },
};
