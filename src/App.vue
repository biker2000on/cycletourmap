<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <Input /> -->
    <Strava />
    <hello-world />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
// import Input from './components/Input.vue'
// import Map from './components/Map.vue'
import Strava from './components/Strava.vue'
import HelloWorld from './components/Mapbox.vue'
import store from './store/index'

export default {
  name: 'app',
  store,
  components: {
    Strava, HelloWorld,
  },
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_KEY,
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}
#map, #map-container {
  width: 100%;
  height: 75vh;
}
</style>
