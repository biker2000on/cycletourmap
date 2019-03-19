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
  data() {
    return {
      tableConfig: [
        {prop: 'date', name: 'Date', sortable: true, summary: 'COUNT'},
        {prop: 'time', name: 'Start Time', sortable: true},
        {prop: 'name', name: 'Name', searchable: true, },
        {prop: 'distance', name: 'Distance (km)', summary: 'SUM', sortable: true, },
        {prop: 'moving_time', name: 'Moving Time (hrs)', summary: 'SUM', sortable: true, },
        {prop: 'elapsed_time', name: 'Elapsed Time (hrs)', summary: 'SUM', sortable: true, },
        {prop: 'total_elevation_gain', name: 'Climbed (m)', summary: 'SUM', sortable: true, },
      ],
    }
  },
  computed: {
    tableData2() {
      return this.$store.state.activities.map(c => {
        return {
          date: c.start_date_local.slice(0,10),
          time: c.start_date_local.slice(11,16),
          name: c.name,
          distance: (c.distance / 1000).toFixed(2),
          moving_time: (c.moving_time / 3600).toFixed(2),
          elapsed_time: (c.elapsed_time / 3600).toFixed(2),
          total_elevation_gain: c.total_elevation_gain,
        }
      })
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
