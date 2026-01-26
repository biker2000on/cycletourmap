<template>
  <v-app>
    <v-app-bar color="primary">
      <v-toolbar-title>
        <router-link to="/" class="text-white text-decoration-none">
          Cycle Tourmap
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn variant="text" :to="{ name: 'home' }">Home</v-btn>
      <v-btn variant="text" :to="{ name: 'faq' }">FAQ</v-btn>

      <template v-if="isAuthenticated">
        <v-btn variant="text" :to="{ name: 'profile' }">Dashboard</v-btn>
        <v-btn variant="text" @click="logout">Logout</v-btn>
      </template>
      <template v-else>
        <v-btn variant="text" :to="{ name: 'auth' }">Sign In</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
      <!-- Named drawer view for pages that need it -->
      <router-view name="drawer"></router-view>
    </v-main>

    <v-footer color="primary">
      <span class="text-white">&copy; {{ new Date().getFullYear() }} Cycle Tourmap</span>
    </v-footer>
  </v-app>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()

    const isAuthenticated = computed(() => !!store.state.token)

    const logout = () => {
      store.commit('logout')
      router.push({ name: 'home' })
    }

    // Initialize auth on app load
    store.dispatch('initAuth')

    return {
      isAuthenticated,
      logout
    }
  }
}
</script>

<style>
html {
  overflow-y: auto !important;
}
</style>
