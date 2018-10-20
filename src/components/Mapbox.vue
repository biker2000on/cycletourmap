<template>
<div>
  <Mapbox
    :access-token="accessToken"
    :map-options="{
      style: 'mapbox://styles/mapbox/light-v9',
      center: [-96, 37.8],
      zoom: 3
    }">
  </Mapbox>

</div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue'

export default {
  name: 'HelloWorld',
  components: { Mapbox },
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
  position: relative !important;
}
</style>
