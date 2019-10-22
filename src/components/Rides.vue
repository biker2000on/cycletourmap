<template>
  <tabulator
    v-if="tableData2.length > 1"
    :columns="columns"
    :tableData="tableData2"
    :tabulatorSettings="tabulatorSettings"
    class="ride-table"
  />
</template>

<script>
import Tabulator from "./Tabulator";

const tabulatorSettings = {
  layout: "fitDataFill"
};

export default {
  components: {
    Tabulator
  },
  props: {
    isMetric: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      tabulatorSettings: tabulatorSettings
    };
  },
  computed: {
    // isMetric() {
    //   return this.$store.state.isMetric;
    // },
    tableData2() {
      return this.$store.state.activities.map(c => {
        return {
          date: c.start_date_local ? c.start_date_local.slice(0, 10) : 'no date',
          time: c.start_date_local ? c.start_date_local.slice(11, 16) : 'no date',
          name: c.name,
          distance: this.isMetric
            ? (c.distance / 1000).toFixed(2)
            : (c.distance / 0.0254 / 12 / 5280).toFixed(2),
          moving_time: (c.moving_time / 3600).toFixed(2),
          elapsed_time: (c.elapsed_time / 3600).toFixed(2),
          total_elevation_gain: this.isMetric
            ? c.total_elevation_gain
            : (c.total_elevation_gain / 0.0254 / 12).toFixed(),
          average_speed: this.isMetric
            ? (c.average_speed * 3.6).toFixed(1)
            : (c.average_speed * 2.23694).toFixed(1)
        };
      });
    },
    columns() {
      return [
        {
          title: "Date",
          field: "date",
          align: "left",
          minWidth: 100
        },
        {
          title: "Start Time",
          field: "time",
          align: "center",
          headerVertical: "flip",
          minWidth: 80
        },
        {
          title: "Name",
          field: "name",
          align: "left",
          minWidth: 100,
          width: 300,
          // formatter: 'textarea',
          variableHeight: true
        },
        {
          title: this.isMetric ? "Distance (km)" : "Distance (mi)",
          field: "distance",
          align: "center",
          headerVertical: "flip",
          minWidth: 80
        },
        {
          title: "Moving Time (hrs)",
          field: "moving_time",
          align: "center",
          headerVertical: "flip",
          minWidth: 80
        },
        {
          title: "Elapsed Time (hrs)",
          field: "elapsed_time",
          align: "center",
          headerVertical: "flip",
          minWidth: 80
        },
        {
          title: this.isMetric ? "Climbed (m)" : "Climbed (ft)",
          field: "total_elevation_gain",
          align: "center",
          headerVertical: "flip",
          minWidth: 80
        },
        {
          title: this.isMetric ? "Avg Spd (kph)" : "Avg Spd (mph)",
          field: "average_speed",
          align: "center",
          headerVertical: "flip",
          minWidth: 80
        }
      ];
    }
  }
};
</script>

<style>
.ride-table {
  height: 90vh;
}
</style>

