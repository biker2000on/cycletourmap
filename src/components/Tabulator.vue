<template>
  <div ref="table"></div>
</template>

<script>
import Tabulator from "tabulator-tables";

export default {
  props: {
    columns: {
      type: Array,
      required: true,
    },
    tableData: {
      type: Array,
      required: true,
    },
    tabulatorSettings: {
      type: Object,
      required: false,
      default: function() { return {} }
    },
  },
  data: () => ({
    tabulator: null,
    error: [],
    widths: 20,
  }),
  mounted() {
    this.tabulator = new Tabulator(this.$refs.table, {
      reactiveData: true,
      data: this.tableData,
      columns: this.columns,
      ...this.tabulatorSettings,
    })
  },
};
</script>

<style scoped>
@import "../../node_modules/tabulator-tables/dist/css/bootstrap/tabulator_bootstrap4.min.css";

div {
  width: 100%;
}

.tabulator .tabulator-header .tabulator-col .tabulator-col-content .tabulator-col-title {
    white-space: normal;
}
</style>
