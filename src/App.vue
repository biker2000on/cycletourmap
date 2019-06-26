<template>
  <div id="app">
    <div class="inline">
      <input type="checkbox" v-model="isMetric"> {{ isMetric ? "Units(Switch to Standard)" : 'Units(Switch to Metric)'}}
      <input type="checkbox" v-model="markersOn"> Markers
      <input type="checkbox" v-model="polylinesOn"> Lines
    </div>
    <Leaflet :markersOn="markersOn" :polylinesOn="polylinesOn" />
    <Summary :isMetric="isMetric" />
    <h2>All Rides</h2>
    <rides :isMetric="isMetric" />
  </div>
</template>

<script>
import Leaflet from "./components/Leaflet.vue";
import Summary from "./components/Summary.vue";
import store from "./store/index";
import Rides from "./components/Rides";

export default {
  name: "app",
  store,
  components: {
    Leaflet,
    Summary,
    Rides
  },
  data: () => ({
    markersOn: true,
    polylinesOn: true,
    isMetric: true,
  })
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
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
.inline {
  display: inline-block;
  font-size: 1.5em;

}

.inline > input {
  margin-left: 3em;
}
</style>
