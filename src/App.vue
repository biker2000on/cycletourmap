<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <Input /> -->
    <Strava />
    <!-- <hello-world /> -->
    <!-- <Map /> -->
    <Leaflet />
    <Vuetable />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import Input from './components/Input.vue'
import Strava from './components/Strava.vue'
// import HelloWorld from './components/Mapbox.vue'
// import Map from './components/Map.vue'
import Leaflet from './components/Leaflet.vue'
import Vuetable from './components/Vuetable.vue'
import store from './store/index'

export default {
  name: 'app',
  store,
  components: {
    Strava, Leaflet, Vuetable,
  },
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

</style>
