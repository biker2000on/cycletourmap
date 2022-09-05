import {
  createApp
} from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import {
  loadFonts
} from './plugins/webfontloader'
import router from './router'

loadFonts()

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app')