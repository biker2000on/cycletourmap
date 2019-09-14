<template>
  <amplify-connect :query="getActivities" >
    <template slot-scope="{loading, data, errors}">
      <v-progress-circular v-if="loading" indeterminate />
      <div v-else-if="errors.length"></div>
      <leaflet v-else-if="data.getTour" :activities="data.getTour.activities.items" />
    </template>
  </amplify-connect>
</template>

<script>
import Leaflet from './Leaflet'

const GetActivitiesQuery = `query GetActivities ($id: ID!) {
  getTour(id: $id) {
    activities(limit: 200) {
      items {
        name
        distance
        elapsed_time
        moving_time
        start_latlng
        start_date_local
        summary_polyline
        type
        strava_id
      }
      nextToken
    } 
  }
} 
`

export default {
  components: {
    Leaflet
  },
  computed: {
    getActivities() {
      return this.$Amplify.graphqlOperation(GetActivitiesQuery, {id: this.$route.params.mapId})
    }
  }
}
</script>

<style>

</style>