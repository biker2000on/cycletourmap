<template>
  <div id="leaflet-comp" :style="computedHeight" class="text-left">
    <l-map
      :bounds="bounds"
      :class="isOnTop"
      :zoom="zoom"
      :center="center"
      :maxBounds="maxBounds"
      @update:zoom="zoomUpdated"
      :inertia="false"
    >
      <l-fullscreen
        @enter-fullscreen="isFullscreen = true"
        @exit-fullscreen="isFullscreen = false"
      />
      <l-control-layers position="topright" class="text-left"></l-control-layers>
      <l-control-scale position="bottomright" :imperial="true" :metric="true"></l-control-scale>
      <l-control position="bottomleft">
        <v-card>
          <v-radio-group v-model="isMetric" hide-details class="pa-1">
            <v-radio
              v-for="(item,idx) in units"
              :key="'units' + idx"
              :label="item.label"
              :value="item.value"
            ></v-radio>
          </v-radio-group>
        </v-card>
      </l-control>
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"
      />
      <l-tile-layer-googlemutant
        v-for="type in googleMapTypes"
        :key="type.type"
        :apikey="googleAPIKey"
        :name="type.name"
        :visible="false"
        lang="en-US"
        :options="{ type: type.type }"
        :ready="ready"
      />
      <l-polyline
        v-for="(start, idx) in popups"
        :lat-lngs="popups[idx][2]"
        :key="'line' + idx"
        :fill="false"
        :weight="activeActivityId == popups[idx][3].id ? 8 : 3"
      >
        <popups :activity="popups[idx][3]" :latlng="start[0]" :key="'pop' + idx" />
      </l-polyline>
      <l-marker v-for="(start,idx) in popups" :lat-lng="start[0]" :key="'marker' + idx">
        <popups :activity="popups[idx][3]" :latlng="start[0]" :key="'pop2' + idx" />
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
  LPolyline,
  LPopup,
  LControlLayers,
  LControlScale,
  LControl
} from "vue2-leaflet";
import LTileLayerGooglemutant from "./LTileLayerGooglemutant";
import LFullscreen from "./Vue2LeafletFullscreen";
import Popups from "./Popups";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import omnivore from "@mapbox/leaflet-omnivore";
import { isNullOrUndefined } from "util";
import { lightFormat } from "date-fns";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
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
    LFullscreen,
    Popups,
    LControl,
    LTileLayerGooglemutant
  },
  props: {
    activities: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      zoom: 2,
      center: [0, 0],
      bounds: null,
      maxBounds: null,
      windowHeight: 300,
      computedHeight: { height: 600 },
      isFullscreen: false,
      ready: false,
      googleAPIKey: process.env.VUE_APP_GOOGLE_MAPS_APIKEY,
      googleMapTypes: [
        { type: "roadmap", name: "Google" },
        { type: "satellite", name: "Satellite" },
        { type: "terrain", name: "Terrain" },
        { type: "hybrid", name: "Hybrid" }
      ],
      tileProviders: [
        {
          name: "OpenCycleMap",
          visible: true,
          url:
            "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=3d3c357594e04c67a183d3c95a1792c0",
          attribution:
            '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        },
        {
          name: "OpenStreetMaps",
          visible: false,
          url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        },
      ],
      units: [
        {
          label: "Metric",
          value: true
        },
        {
          label: "Standard",
          value: false
        }
      ]
    };
  },
  computed: {
    // activities() {
    //   return this.$store.state.activities.filter(c => c)
    // },
    isOnTop() {
      return this.isFullscreen ? "on-top" : "leaflet-regular";
    },
    activeActivityId() {
      return this.$store.state.activeActivityId
    },
    isMetric: {
      get() {
        return this.$store.state.isMetric;
      },
      set(val) {
        this.$store.commit("setMetric", val);
      }
    },
    rides() {
      let ride = this.activities.map(activity => {
        if (activity.start_latlng) {
          return activity.start_latlng;
        }
        return;
      });
      return ride.filter(c => c);
    },
    popups() {
      let popup = this.activities.map(activity => {
        let coords;
        if (activity.summary_polyline) {
          let poly = omnivore.polyline.parse(activity.summary_polyline);
          coords =
            poly._layers[poly._leaflet_id - 1].feature.geometry.coordinates;
          if (coords) {
            coords = coords.map(c => c.reverse());
          }
        }
        return [
          coords ? coords[0] : null,
          "<p>" +
            activity.name +
            "<br>" +
            lightFormat(new Date(activity.start_date_local), "M/d/yyyy") +
            "<br>" +
            (this.isMetric
              ? (activity.distance / 1000).toFixed(2) + " km "
              : (activity.distance / 0.0254 / 12 / 5280).toFixed(2) + " mi") +
            activity.type +
            "<br>" +
            (activity.moving_time / 3600).toFixed(2) +
            " hrs Moving   " +
            (activity.elapsed_time / 3600).toFixed(2) +
            " hrs Total</p><br>" +
            '<a href="https://www.strava.com/activities/' +
            activity.strava_id +
            '" target="_blank">View on Strava</a>',
          coords ? coords : null,
          {
            ...activity
          }
        ];
      });
      return popup.filter(c => c[0]);
    }
    // route() {
    //   let gpx = omnivore.gpx('/2019_Trans-Asia_Tour.gpx')
    //   // let coords = gpx._layers
    //   return gpx
    // }
  },
  watch: {
    rides(vals) {
      this.zoomAll(vals);
    },
    windowHeight() {
      // (new, old)
      const top = this.$vuetify.application.top;
      const bottom = this.$vuetify.application.footer || 0;
      const total = this.windowHeight;
      this.computedHeight = { height: total - top - bottom };
    }
  },
  methods: {
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    zoomAll() {
      if (!this.activities.length) return;
      //reduces to bounding box of values
      let box = this.activities.reduce((a, current) => {
        let c = current.start_latlng;
        if (JSON.stringify(a) == "[]") {
          a = [c, c];
          return a;
        }
        if (isNullOrUndefined(c)) return a;
        let minLat = a[0][0];
        let maxLat = a[1][0];
        let minLong = a[0][1];
        let maxLong = a[1][1];
        if (isNaN(c[0]) || isNaN(c[1])) {
          return a;
        }
        if (c[0] < a[0][0]) {
          minLat = c[0];
        }
        if (c[0] > a[1][0]) {
          maxLat = c[0];
        }
        if (c[1] < a[0][1]) {
          minLong = c[1];
        }
        if (c[1] > a[1][1]) {
          maxLong = c[1];
        }
        a = [[minLat, minLong], [maxLat, maxLong]];
        return a;
      }, []);
      // let centerLat = (box[0][0] + box[1][0]) / 2
      // let centerLong = (box[0][1] + box[1][1]) / 2
      // this.center = [centerLat, centerLong]
      let bounds = [
        [box[0][0] - 0.5, box[0][1] - 0.5],
        [box[1][0] + 0.5, box[1][1] + 0.5]
      ];
      setTimeout(() => {
        this.bounds = bounds;
      }, 500);
    }
  },
  mounted() {
    if (!(typeof google === 'object' && typeof google.maps === 'object')) {
      let googleapisscript = document.createElement('script');
      let scriptUrl = 'https://maps.googleapis.com/maps/api/js?key='+this.googleAPIKey;
      
      scriptUrl += this.lang ? '&language='+this.lang : '';
      scriptUrl += this.region ? '&region='+this.region : '';
      
      googleapisscript.setAttribute('src', scriptUrl);
      document.head.appendChild(googleapisscript);
    }
    this.ready = true
    this.$nextTick(() => {
      window.addEventListener("resize", () => {
        this.windowHeight = window.innerHeight;
      });
      this.windowHeight = window.innerHeight;
      this.zoomAll();
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", () => {
      this.windowHeight = window.innerHeight;
    });
  }
};
</script>

<style lang="scss">
#leaflet-comp {
  width: 100%;
  margin: auto;
}
.on-top {
  z-index: 9999 !important;
}
.leaflet-regular {
  z-index: 0;
}
.leaflet-popup-content {
  margin: 0;
}
</style>
