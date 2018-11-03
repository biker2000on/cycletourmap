<template lang="html">
  <div id="leaflet-comp">
    <l-map :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-marker :lat-lng="marker"></l-marker>
      <l-marker :lat-lng="[47,-1]"></l-marker>
      <l-marker v-for="(start, idx) in rides" :lat-lng="start" :key="idx"></l-marker>
      <l-polyline v-for="(line, idx) in polylines" :lat-lngs="line" :key="idx" fill="false"></l-polyline>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline } from 'vue2-leaflet'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import polyUtil from 'polyline-encoded'
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolyline
  },
  data() {
    return {
      zoom:8,
      center: L.latLng(47.413220, -1.219482),
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(47.413220, -1.219482),
    }
  },
  computed: {
    rides() {
      return this.$store.state.activities.map(activity => activity.start_latlng)
    },
    polylines() {
      return this.$store.state.activities.map(activity => polyUtil.decode(activity.map.summary_polyline))
    }
  }
}
</script>

<style lang="css">
#leaflet-comp {
  height: 90vh;
  margin: 0;
}
</style>
