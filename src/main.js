import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import Vuetify from  'vuetify/lib'
Vue.use(Vuetify)

//styles for Vuetify
import 'vuetify/dist/vuetify.min.css'


// const router = new VueRouter()

new Vue({
  // router,
  render: h => h(App)
}).$mount('#app')
