<template lang="html">
  <div id="leaflet-comp" :style="computedHeight">
    <l-map 
      :bounds="bounds"
      :zoom="zoom" 
      :center="center"
      :maxBounds="maxBounds"
      @update:zoom="zoomUpdated"
      :inertia="false"
      >
      <l-control-layers position="topright"  ></l-control-layers>
      <l-control-scale position="bottomright" :imperial="true" :metric="true"></l-control-scale>
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base" />
      <!-- <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer> -->
      <l-polyline v-for="(start, idx) in popups" :lat-lngs="popups[idx][2]" :key="'line' + idx" :fill="false">
        <l-popup :lat-lng="popups[idx][0]" :content="popups[idx][1]" :key="'pop' + idx"></l-popup>
      </l-polyline>
      <l-marker v-for="(start,idx) in popups" :lat-lng="start[0]" :key="'marker' + idx">
        <l-popup :lat-lng="popups[idx][0]" :content="popups[idx][1]" :key="'pop2' + idx"></l-popup>
      </l-marker>
      <!-- <l-polyline v-for="(line, idx) in polylines" :lat-lngs="line" :key="'line' + idx" :fill="false"></l-polyline> -->
      <!-- <l-polyline :lat-lngs="route" :fill="false"></l-polyline> -->
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPolyline, LPopup, LControlLayers, LControlScale } from 'vue2-leaflet'
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
    LControlLayers,
    LControlScale,
  },
  props: {
    activities: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      zoom:2,
      center: [0,0],
      bounds: null,
      maxBounds: null,
      windowHeight: window.innerHeight,
      computedHeight: {height: 600},
      tileProviders: [
        {
          name: 'OpenStreetMaps',
          visible: false,
          url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        },
        {
          name: 'OpenCycleMap',
          visible: true,
          url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=3d3c357594e04c67a183d3c95a1792c0',
          attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ]
    }
  },
  computed: {
    isMetric() {
      return this.$store.state.isMetric
    },
    rides() {
      let ride = this.activities.map(activity => {
        if (activity.start_latlng) {return activity.start_latlng}
        return
      })
      return ride.filter(c => c)
    },
    polylines() {
      let poly = this.activities.map(activity => {
        if (activity.map.summary_polyline) {
          let poly = omnivore.polyline.parse(activity.map.summary_polyline)
          let coords = poly._layers[poly._leaflet_id - 1].feature.geometry.coordinates
          if (coords) {
            coords = coords.map(c => c.reverse())
            return coords
          }
        }
        return
      })
      return poly.filter(c => c)
    },
    popups() {
      let popup = this.activities.map(activity => {
        let coords
        if (activity.map.summary_polyline) {
          let poly = omnivore.polyline.parse(activity.map.summary_polyline)
          coords = poly._layers[poly._leaflet_id - 1].feature.geometry.coordinates
          if (coords) {
            coords = coords.map(c => c.reverse())
          }
        }
        return [activity.start_latlng, 
               "<p>" + activity.name + "<br>" + 
               (this.isMetric ? (activity.distance / 1000).toFixed(2) + " km " : (activity.distance / .0254 / 12 / 5280).toFixed(2) + " mi ")+ 
               activity.type + "<br>" + 
               (activity.moving_time / 3600).toFixed(2) + " hrs Moving   " + (activity.elapsed_time / 3600).toFixed(2) + " hrs Total</p><br>" +
               '<a href="https://www.strava.com/activities/' + activity.id + '" target="_blank">View on Strava</a>',
               coords ? coords : null
               ] 
      })
      return popup.filter(c => c[0])
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
    windowHeight(newHeight, oldHeight) {
      this.computeHeight()
    }
  },
  methods: {
    computeHeight() {
      const top = this.$vuetify.application.top
      const bottom = this.$vuetify.application.footer || 0
      const total = this.windowHeight
      this.computedHeight = { height: total - top - bottom }
    },
    zoomUpdated (zoom) {
      this.zoom = zoom;
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.windowHeight = window.innerHeight
      });
      this.computeHeight()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize')
  }
}
</script>

<style lang="css">
#leaflet-comp {
  width: 100%;
  margin: auto;
}
</style>
