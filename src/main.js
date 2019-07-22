import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'

Vue.config.productionTip = false

//styles for Vuetify
import 'vuetify/dist/vuetify.min.css'


// const router = new VueRouter()

new Vue({
  // router,
  render: h => h(App)
}).$mount('#app')
