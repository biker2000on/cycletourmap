import Vue from 'vue'
import App from './App.vue'
import VueMapbox from 'vue-mapbox'
import Mapbox from 'mapbox-gl'
// import VueAxios from 'vue-axios'
// import axios from 'axios'

// Vue.use(VueAxios, axios)
Vue.use(VueMapbox, { mapboxgl: Mapbox })
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
