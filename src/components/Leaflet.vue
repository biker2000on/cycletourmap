<template lang="html">
  <div id="leaflet-comp">
    <l-map 
      :bounds="bounds"
      :zoom="zoom" 
      :center="center"
      :maxBounds="maxBounds"
      @update:zoom="zoomUpdated"
      :inertia="false"
      >
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-marker v-for="(start, idx) in popups" :lat-lng="start[0]" :key="'marker' + idx">
        <l-popup :lat-lng="popups[idx][0]" :content="popups[idx][1]" :key="'pop' + idx"></l-popup>
      </l-marker>
      <l-polyline v-for="(line, idx) in polylines" :lat-lngs="line" :key="'line' + idx" :fill="false"></l-polyline>
      <!-- <l-polyline :lat-lngs="route" :fill="false"></l-polyline> -->
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline, LPopup } from 'vue2-leaflet'
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
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
      bounds: null,
      maxBounds: null,
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
        if (coords) {
          coords = coords.map(c => c.reverse())
          return coords
        }
      })
    },
    popups() {
      return this.$store.state.activities.map(activity => {
        return [activity.start_latlng, 
               "<p>" + activity.name + "<br>" + (activity.distance / 1000).toFixed(2) + " km " + activity.type + "<br>" + 
               (activity.moving_time / 3600).toFixed(2) + " hrs Moving   " + (activity.elapsed_time / 3600).toFixed(2) + " hrs Total</p><br>" +
               '<a href="https://www.strava.com/activities/' + activity.id + '" target="_blank">View on Strava</a>'
               ] 
      })
    },
    // route() {
    //   let gpx = omnivore.gpx('/2019_Trans-Asia_Tour.gpx')
    //   // let coords = gpx._layers
    //   return gpx
    // }
  }, 
  watch: {
    rides(vals) {
      //reduces to bounding box of values
      let box = vals.reduce((a,c) => {
        if (JSON.stringify(a) == '[]') {
          a = [c,c]
          return a
        } 
        let minLat = a[0][0]
        let maxLat = a[1][0]
        let minLong = a[0][1]
        let maxLong = a[1][1]
        if (isNaN(c[0]) || isNaN(c[1])) {
          return a
        }
        if (c[0] < a[0][0]) {
          minLat = c[0]
        } 
        if (c[0] > a[1][0]) {
          maxLat = c[0]
        }
        if (c[1] < a[0][1]) {
          minLong = c[1]
        }
        if (c[1] > a[1][1]) {
          maxLong = c[1]
        }
        a = [[minLat,minLong],[maxLat,maxLong]]
        return a
      },[])
      // let centerLat = (box[0][0] + box[1][0]) / 2
      // let centerLong = (box[0][1] + box[1][1]) / 2
      // this.center = [centerLat, centerLong]
      let bounds = [[box[0][0]-1, box[0][1]-1],
                    [box[1][0]+1, box[1][1]+1]]
      setTimeout(() => {this.bounds = bounds},500)
    },
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
    zoomUpdated (zoom) {
      this.zoom = zoom;
    },
  },
  mounted() {
    this.getAllActivities()
  }
}
</script>

<style lang="css">
#leaflet-comp {
  height: 75vh;
  width: 100%;
  margin: auto;
}
</style>
