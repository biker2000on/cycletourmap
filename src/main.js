import Vue from 'vue'
import App from './App.vue'
import VueMapbox from 'vue-mapbox'
import Mapbox from 'mapbox-gl'

Vue.use(VueMapbox, { mapboxgl: Mapbox })
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
