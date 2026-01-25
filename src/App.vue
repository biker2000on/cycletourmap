<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>
        <router-link to="/" class="text-white text-decoration-none">
          Cycle Tourmap
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn text :to="{ name: 'home' }">Home</v-btn>
      <v-btn text :to="{ name: 'faq' }">FAQ</v-btn>

      <template v-if="isAuthenticated">
        <v-btn text :to="{ name: 'profile' }">Dashboard</v-btn>
        <v-btn text @click="logout">Logout</v-btn>
      </template>
      <template v-else>
        <v-btn text :to="{ name: 'auth' }">Sign In</v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <router-view name="drawer"></router-view>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-footer app color="primary" dark>
      <span class="white--text">&copy; {{ new Date().getFullYear() }} Cycle Tourmap</span>
    </v-footer>
  </v-app>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()
    const drawer = ref(false)

    const isAuthenticated = computed(() => !!store.state.token)

    const logout = () => {
      store.commit('logout')
      router.push({ name: 'home' })
    }

    return {
      drawer,
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
