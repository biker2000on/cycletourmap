<template>
  <div id="app">
    <Toggle id="toggle"/>
    <Leaflet />
    <Summary />
    <h2>All Rides</h2>
    <rides />
  </div>
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
