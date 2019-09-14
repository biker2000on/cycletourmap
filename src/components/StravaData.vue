<template>
  <amplify-connect :query="getTour" >
    <template slot-scope="{loading, data, errors}" >
      <v-progress-circular v-if="loading" indeterminate ></v-progress-circular>
      <div v-else-if="errors.length"></div>
      <div v-else-if="data">
        <strava />
      </div>
  </amplify-connect>
</template>

<script>
import Strava from './Strava'

export default {
  components: {
    Strava
  },
  computed: {
    getTour() {
      return this.$Amplify.graphqlOperation(GetTour, {id: this.$route.params.mapId})
    }
  }
}
</script>

<style>

</style>