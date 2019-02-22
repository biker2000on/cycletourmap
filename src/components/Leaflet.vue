<template lang="html">
  <div id="leaflet-comp">
    <l-map :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <!-- <l-marker :lat-lng="marker"></l-marker> -->
      <!-- <l-marker :lat-lng="[47,-1]"></l-marker> -->
      <l-marker v-for="(start, idx) in popups" :lat-lng="start[0]" :key="'marker' + idx">
        <l-popup :lat-lng="popups[idx][0]" :content="popups[idx][1]" :key="'pop' + idx"></l-popup>
      </l-marker>
      <!-- <l-polyline v-for="(line, idx) in polylines" :lat-lngs="line" :key="'line' + idx" :fill="false"></l-polyline> -->
      <!-- <l-polyline :lat-lngs="route" :fill="false"></l-polyline> -->
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline, LPopup } from 'vue2-leaflet'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
// import polyUtil from 'polyline-encoded'
import omnivore from "@mapbox/leaflet-omnivore";
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
    LPolyline,
    LPopup,
  },
  data() {
    return {
      zoom:2,
      center: [0,0],
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }
  },
  computed: {
    rides() {
      return this.$store.state.activities.map(activity => activity.start_latlng)
    },
    polylines() {
      return this.$store.state.activities.map(activity => {
        let poly = omnivore.polyline.parse(activity.map.summary_polyline)
        let coords = poly._layers[poly._leaflet_id - 1].feature.geometry.coordinates
        console.log(coords)
        // let finalcoords = coords.map(point => point.reverse())
        // console.log(coords)
        if (coords) {
          return coords
        } else {
          console.log(coords)
          return
        }
      })
    },
    popups() {
      return this.$store.state.activities.map(activity => {
        return [activity.start_latlng, 
               "<p>" + activity.name + "<br>" + (activity.distance / 1000).toFixed(2) + " km " + activity.type + "<br>" + 
               (activity.moving_time / 3600).toFixed(2) + " hrs Moving   " + (activity.elapsed_time / 3600).toFixed(2) + " hrs Total</p>"
               ] 
      })
    },
    // route() {
    //   let gpx = omnivore.gpx('/2019_Trans-Asia_Tour.gpx')
    //   let coords = gpx._layers
    //   return coords
    // }
  }, 
  methods: {
    getAllActivities: async function () {
      const start = new Date(this.$store.state.start)
      let page = 1
      let acts = []
      let activities = ''
      do {
        let strava = await fetch('https://www.strava.com/api/v3/athletes/7594/activities?access_token=641c02aede2bd589ccf83096c9ea706c2fd3a1ec&per_page=50&page=' + page)
        activities = await strava.json()
        let dates = activities.reduce((a,c)=>{
          let rideStart = new Date(c.start_date)
          if (start > rideStart) {
            return true
          } else { return a }
        }, false)
        activities = activities.filter(c => {
          let rideStart = new Date(c.start_date)
          return rideStart >= start
        })
        acts = acts.concat(activities)
        if (dates) {
          this.$store.commit('setActivities', acts)
          return
        }
        page++
      } while (activities != '')
      this.$store.commit('setActivities', acts)
      return
    },
  },
  mounted() {
    this.$nextTick(this.getAllActivities())
  }
}
</script>

<style lang="css">
#leaflet-comp {
  height: 75vh;
  width: 800px;
  margin: auto;
}
</style>
