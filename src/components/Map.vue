<template>
<div>
  <mgl-map
    :accessToken="accessToken"
    :mapStyle.sync="mapStyle"
  >
    <!-- <mgl-navigation-control position="top-left" /> -->
    <!-- <mgl-geolocate-control position="top-left" /> -->
    <!-- <mgl-popup :coordinates="popupCoordinates">
      <span>Hello world!</span>
    </mgl-popup> -->
    <mgl-marker v-for="(coordinate,index) in coordinates" :coordinates="coordinate" :key="index" color="blue"></mgl-marker>
    <mgl-marker v-for="(start, index) in rides" :coordinates="start" :key="index" color="red"></mgl-marker>
  </mgl-map>
</div>
</template>

<script>
import { 
  MglMap, 
  MglNavigationControl, 
  MglGeolocateControl, 
  MglPopup,
  MglMarker,
  } from 'vue-mapbox'

export default {
  components: {
    'mgl-map': MglMap,
    'mgl-navigation-control': MglNavigationControl, 
    'mgl-geolocate-control': MglGeolocateControl,
    'mgl-popup': MglPopup,
    'mgl-marker': MglMarker
  },
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_KEY, // your access token. Needed if you using Mapbox maps
      mapStyle: 'mapbox://styles/mapbox/light-v9',  // your map style
      popupCoordinates: [10,10],
      coordinates: [[-110,35],[-90,37],[110,22]],
    }
  },
  computed: {
    rides() {
      return this.$store.state.activities.map(activity => activity.start_latlng.reverse())
    }
  }
}
</script>

<style scoped>
div {
  width:100%;
  height: 75vh;
  text-align: center;
}
canvas {
  position: relative;
}
</style>
