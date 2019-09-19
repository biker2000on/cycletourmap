<template>
  <ApolloQuery :query="require('../gql/getTourActivities.gql')"
  :variables="{ id: $route.params.mapId }">
    <template slot-scope="{ result: {loading, data, error}}">
      <v-progress-circular v-if="loading" indeterminate />
      <leaflet v-else-if="data" :activities="data.getTour.activities.items" />
      <leaflet v-else-if="$route.params.mapId == 'new'" :activities="$store.state.activities" /> 
      <div v-else-if="error">{{ error }}</div>
    </template>
  </ApolloQuery>
</template>

<script>
import Leaflet from './Leaflet'

export default {
  components: {
    Leaflet
  },
}
</script>

<style>

</style>