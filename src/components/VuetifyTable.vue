<template>
  <v-data-table
    :headers="headers"
    :items="tableData2"
    item-key="name"
    :pagination.sync="pagination" 
    class="elevation-1"
  >
    <!-- <template v-slot:headers="props">
      <tr>
        <th v-for="header in props.headers" 
          :key="header.text" 
          :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          @click="changeSort(header.value)">
          <v-icon small>arrow_upward</v-icon>
          {{ header.text }}
        </th>
      </tr>
    </template> -->
    <template v-slot:items="props">
      <tr>
        <td>{{props.item.date}}</td>
        <td>{{props.item.time}}</td>
        <td>{{props.item.name}}</td>
        <td>{{props.item.distance}}</td>
        <td>{{props.item.moving_time}}</td>
        <td>{{props.item.elapsed_time}}</td>
        <td>{{props.item.total_elevation_gain}}</td>
      </tr>
    </template>

  </v-data-table>
</template>

<script>
import {VDataTable, VIcon} from 'vuetify/lib'
export default {
  components: {
    VDataTable, VIcon
  },
  data: () => ({
    pagination: {
      sortBy: 'date',
      descending: true,
      rowsPerPage: -1,
    },
  }),
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
        {value: 'time', text: 'Start Time', sortable: true, width: 15},
        {value: 'name', text: 'Name', width: 70},
        {value: 'distance', text: this.isMetric ? 'Distance (km)' : 'Distance (mi)', sortable: true, width: 15 },
        {value: 'moving_time', text: 'Moving Time (hrs)', sortable: true, width: 15},
        {value: 'elapsed_time', text: 'Elapsed Time (hrs)', sortable: true, width: 15},
        {value: 'total_elevation_gain', text: this.isMetric ? 'Climbed (m)' : 'Climbed (ft)', sortable: true, width: 15 },
      ]
    }
  },
  methods: {
    changeSort (column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending
      } else {
        this.pagination.sortBy = column
        this.pagination.descending = false
      }
    },

  }
}
</script>

<style scoped>
table.v-table {
  padding: 0 0;
}
</style>
