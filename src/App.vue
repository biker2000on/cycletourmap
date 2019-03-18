<template>
  <div id="app">
    <Leaflet />
    <Summary />
    <h2>All Rides</h2>
    <Vuetable />
  </div>
</template>

<script>
import Leaflet from './components/Leaflet.vue'
import Vuetable from './components/Vuetable.vue'
import Summary from './components/Summary.vue'
import store from './store/index'

export default {
  name: 'app',
  store,
  components: {
    Leaflet, Vuetable, Summary
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

</style>
