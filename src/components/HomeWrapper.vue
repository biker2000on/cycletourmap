<template>
  <div>
    <profile v-if="signedIn" />
    <home v-else />
  </div>
</template>

<script>
import Home from './Home'
import Profile from './Profile'

export default {
  components: {
    Home,
    Profile,
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