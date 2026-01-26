<template>
  <v-navigation-drawer v-model="drawer" id="nav-drawer" v-if="signedIn" >
    <router-view name="drawer"></router-view>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      drawer: true
    }
  },
  computed: {
    signedIn() {
      return this.$store.state.signedIn
    }
  }
}
</script>

<style>

</style>