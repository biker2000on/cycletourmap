
<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-tile @click>
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click>
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contact</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app color="indigo" dark>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-toolbar>

    <v-content>
      <v-container fluid fill-height>
            <Leaflet :markersOn="markersOn" :polylinesOn="polylinesOn" />
            <!-- <div class="inline">
              <input type="checkbox" v-model="isMetric" />
              {{ isMetric ? "Units(Switch to Standard)" : 'Units(Switch to Metric)'}}
              <input
                type="checkbox"
                v-model="markersOn"
              /> Markers
              <input type="checkbox" v-model="polylinesOn" /> Lines
            </div>
            <Summary :isMetric="isMetric" />
            <h2>All Rides</h2>
            <rides :isMetric="isMetric" /> -->
        <v-layout align-center justify-center>
          <v-flex text-center>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <!-- <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer> -->
  </v-app>
</template>

<script>
import Leaflet from './components/Leaflet.vue'
import Summary from './components/Summary.vue'
import store from './store/index'
import Rides from './components/Rides'

export default {
  name: 'app',
  store,
  components: {
    Leaflet, Summary, Rides
  },
  data() {
    return {
      markersOn: true,
      polylinesOn: true,
      isMetric: false,
      drawer: null,
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 10px;
}
h2 {
  text-align: center;
}
#toggle {
  margin-bottom: 5px;
}

</style>
