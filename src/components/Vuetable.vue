<template>
  <vue-virtual-table
    :config="tableConfig"
    :data="tableData2"
    :height="500"
    :minWidth="800"
    :itemHeight="80"
    :enableExport="true"
    language="en"
  >
  </vue-virtual-table>
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
    tableConfig() {
      return [
        {prop: 'date', name: 'Date', sortable: true, summary: 'COUNT'},
        {prop: 'time', name: 'Start Time', sortable: true},
        {prop: 'name', name: 'Name', searchable: true, },
        {prop: 'distance', name: this.isMetric ? 'Distance (km)' : 'Distance (mi)', summary: 'SUM', sortable: true, },
        {prop: 'moving_time', name: 'Moving Time (hrs)', summary: 'SUM', sortable: true, },
        {prop: 'elapsed_time', name: 'Elapsed Time (hrs)', summary: 'SUM', sortable: true, },
        {prop: 'total_elevation_gain', name: this.isMetric ? 'Climbed (m)' : 'Climbed (ft)', summary: 'SUM', sortable: true, },
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
