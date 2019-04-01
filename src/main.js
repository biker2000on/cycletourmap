import Vue from 'vue'
import App from './App.vue'

import Vuetify from  'vuetify/lib'
Vue.use(Vuetify)

Vue.config.productionTip = false

//styles for Vuetify
import 'vuetify/dist/vuetify.min.css'


// const router = new VueRouter()

new Vue({
  // router,
  render: h => h(App)
}).$mount('#app')
