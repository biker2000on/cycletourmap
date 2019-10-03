<template>
  <l-popup :lat-lng="latlng">
    <v-card min-width="256">
      <v-list-item two-line >
        <v-list-item-content>
          <v-list-item-title class="headline text-wrap">{{activity.name}}</v-list-item-title>
          <v-list-item-subtitle>{{activity.start_date_local.slice(0,10)}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-card-text class="py-0">
        <p class="my-1">Distance: {{(isMetric ? (activity.distance / 1000).toFixed(2) + " km " : (activity.distance / .0254 / 12 / 5280).toFixed(2) + " mi")}}</p>
        <p class="my-1">Type: {{activity.type}}</p>
        <p class="my-1">Moving Time: {{(activity.moving_time / 3600).toFixed(2)}} hrs</p>
        <p class="my-1">Elapsed Time: {{(activity.elapsed_time / 3600).toFixed(2)}} hrs</p>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :href="'https://www.strava.com/activities/' + activity.strava_id" target="_blank" color="#FC4C02" dark small>View on Strava</v-btn>
      </v-card-actions>
    </v-card>
  </l-popup>
</template>

<script>
import { LPopup } from 'vue2-leaflet'

export default {
  components: {
    LPopup
  },
  props: {
    activity: {
      type: Object,
      default: () => {}
    }, 
    latlng: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isMetric() {
      return this.$store.state.isMetric
    }
  }
}
</script>

<style>

</style>