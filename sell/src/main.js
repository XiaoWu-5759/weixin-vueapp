// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App"; // App.vue
import router from "./router";
// import VueRouter from "vue-router";

Vue.config.productionTip = false;

// Vue.use(VueRouter);

/* eslint-disable no-new */
new Vue({
  // 挂载点
  el: "#app",
  router,
  // 注册组件
  components: { App },
  template: "<App/>"
});
