<template>
  <v-navigation-drawer v-model="drawer" app id="nav-drawer" v-if="signedIn" clipped >
    <router-view name="drawer"></router-view>
  </v-navigation-drawer>
</template>

<script>
export default {
  computed: {
    signedIn() {
      return this.$store.state.signedIn
    }
  }
}
</script>

<style>

</style>