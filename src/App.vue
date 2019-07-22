
<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <v-list-item @click>
          <v-list-item-action>
            <v-icon>home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click>
          <v-list-item-action>
            <v-icon>contact_mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Contact</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="indigo" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex text-center>
            <div class="inline">
              <input type="checkbox" v-model="isMetric" />
              {{ isMetric ? "Units(Switch to Standard)" : 'Units(Switch to Metric)'}}
              <input
                type="checkbox"
                v-model="markersOn"
              /> Markers
              <input type="checkbox" v-model="polylinesOn" /> Lines
            </div>
            <Leaflet :markersOn="markersOn" :polylinesOn="polylinesOn" />
            <Summary :isMetric="isMetric" />
            <h2>All Rides</h2>
            <rides :isMetric="isMetric" />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
    <v-footer color="indigo" app>
      <span class="white--text">&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import Leaflet from './components/Leaflet.vue'
import Summary from './components/Summary.vue'
import Toggle from './components/Toggle.vue'
import store from './store/index'
import Rides from './components/Rides'

export default {
  name: 'app',
  store,
  components: {
    Leaflet, Summary, Toggle, Rides
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
