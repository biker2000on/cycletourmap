import { createApp } from 'vue'
import App from './App.vue'
import store from './store/index'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'

loadFonts()

const app = createApp(App)
  .use(store)
  .use(router)
  .use(vuetify)

// Initialize auth state from stored token
store.dispatch('initAuth').finally(() => {
  app.mount('#app')
})
