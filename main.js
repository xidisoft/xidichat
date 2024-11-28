import App from './App'


import Vue from 'vue'
import uView from "uview-ui";

import store from './store'; 
Vue.use(uView);

import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
	store,
  ...App
})
// 引入请求封装，将app参数传递到配置中
require('@/config/request.js')(app)
import api from "@/config/api.js";
Vue.use(api)
app.$mount()


