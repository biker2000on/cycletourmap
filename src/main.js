import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from './store'
import vuetify from './plugins/vuetify'
import { appsyncProvider } from './plugins/apollo'
import './plugins/analytics'
import './plugins/amplify'

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  store,
  apolloProvider: appsyncProvider,
  render: h => h(App)
}).$mount('#app')
