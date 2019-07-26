import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

// const router = new VueRouter()

new Vue({
  // router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
