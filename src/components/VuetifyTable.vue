<template>
  <v-data-table
    :headers="headers"
    :items="tableData2"
    :height="500"
    :minWidth="800"
    :itemHeight="80"
    :enableExport="true"
    language="en"
  >
  </v-data-table>
</template>

<script>
import VueVirtualTable from 'vue-virtual-table'
export default {
  components: {
    VueVirtualTable
  },
  computed: {
    isMetric() {
      return this.$store.state.isMetric
    },
    tableData2() {
      return this.$store.state.activities.map(c => {
        return {
          date: c.start_date_local.slice(0,10),
          time: c.start_date_local.slice(11,16),
          name: c.name,
          distance: this.isMetric ? (c.distance / 1000).toFixed(2) : (c.distance / 0.0254 / 12 / 5280).toFixed(2),
          moving_time: (c.moving_time / 3600).toFixed(2),
          elapsed_time: (c.elapsed_time / 3600).toFixed(2),
          total_elevation_gain: this.isMetric ? c.total_elevation_gain: (c.total_elevation_gain / 0.0254 / 12).toFixed(),
        }
      })
    },
    headers() {
      return [
        {value: 'date', text: 'Date', sortable: true},
        {value: 'time', text: 'Start Time', sortable: true},
        {value: 'name', text: 'Name', searchable: true, },
        {value: 'distance', text: this.isMetric ? 'Distance (km)' : 'Distance (mi)', sortable: true, },
        {value: 'moving_time', text: 'Moving Time (hrs)', sortable: true, },
        {value: 'elapsed_time', text: 'Elapsed Time (hrs)', sortable: true, },
        {value: 'total_elevation_gain', text: this.isMetric ? 'Climbed (m)' : 'Climbed (ft)', sortable: true, },
      ]
    }
  }
}
</script>

<style>
  .item-cell-inner, .header-cell-inner {
    word-break: normal !important;
    text-align: center;
  }
  .item-line {
    height: fit-content !important
  }

</style>
