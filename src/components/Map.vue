<template>
<div>
  <mgl-map
      :accessToken="accessToken"
      :mapStyle.sync="mapStyle"
  />
</div>
</template>

<script>
import { MglMap } from 'vue-mapbox'

export default {
  components: {
    MglMap
  },
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_KEY, // your access token. Needed if you using Mapbox maps
      mapStyle: 'mapbox://styles/mapbox/light-v9',  // your map style
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
