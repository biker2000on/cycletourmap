import Vue from 'vue'
import App from './App.vue'
import VueMapbox from 'vue-mapbox'
import Mapbox from 'mapbox-gl'
import VueRouter from 'vue-router'

Vue.use(VueMapbox, { mapboxgl: Mapbox })
Vue.use(VueRouter)
Vue.config.productionTip = false

const router = new VueRouter()

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
