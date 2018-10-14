<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <Input />
    <Strava />
    <Map />
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import Input from './components/Input.vue'
import Map from './components/Map.vue'
import Strava from './components/Strava.vue'
import store from './store/index'

export default {
  name: 'app',
  store,
  components: {
    Input, Map, Strava //, HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.mapboxgl-canvas {
  position: relative;
}
</style>
